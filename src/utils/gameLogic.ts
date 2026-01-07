import { Piece, Square, PieceType, GameState, files, ranks, squareToCoords, coordsToSquare, PieceColor, MAX_RAY_STEPS, Move } from '../types/chess';

export function getPieceValidMoves(piece: Piece, game: GameState): Move[] {
    let pieceValidMoves: Move[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);

    if (piece.type === 'pawn') {
        pieceValidMoves = getPawnMoves(piece, game.pieces, game);
    }

    const directions = getPieceDirections(piece.type);

    for (const [dx, dy] of directions) {
        if (piece.type === 'knight') {
            const newX = fromX + dx;
            const newY = fromY + dy;

            if (isWithinBoard(newX, newY)) {
                const targetSquare = coordsToSquare(newX, newY);
                const targetPiece = getPieceAtSquare(targetSquare, game.pieces);

                if (!targetPiece || targetPiece.color !== piece.color) {
                    pieceValidMoves.push({
                        pieceId: piece.id,
                        from: piece.position,
                        to: targetSquare,
                        capturedPiece: targetPiece
                    });
                }
            }
        }
        else {
            let steps = 1;
            while (true) {
                const newX = fromX + steps * dx;
                const newY = fromY + steps * dy;

                if (!isWithinBoard(newX, newY)) break;

                const targetSquare = coordsToSquare(newX, newY);
                const targetPiece = getPieceAtSquare(targetSquare, game.pieces);
                
                if (!targetPiece) {
                    pieceValidMoves.push({
                        pieceId: piece.id,
                        from: piece.position,
                        to: targetSquare,
                        capturedPiece: targetPiece
                    });
                }
                else if (targetPiece.color !== piece.color) {
                    pieceValidMoves.push({
                        pieceId: piece.id,
                        from: piece.position,
                        to: targetSquare,
                        capturedPiece: targetPiece
                    });
                    break;
                } else { 
                    break; 
                }

                // Только слон, ладья и ферзь могут ходить на несколько клеток
                if (piece.type === 'king') {
                    break;
                }

                steps++;
            }
        }
    }

    const safeMoves: Move[] = [];

    for (const move of pieceValidMoves) {
        const newBoard = simulateMove(game.pieces, piece, move.to);
    
        if (!isKingInCheck(piece.color, newBoard)) {
            safeMoves.push(move);
        }
    }

    if(piece.type === 'king' && piece.hasMoved === false) {
        const { x, y } = squareToCoords(piece.position);
        const rightSide = getPieceAtSquare(coordsToSquare(x+3, y), game.pieces);
        const leftSide = getPieceAtSquare(coordsToSquare(x-4, y), game.pieces);

        if(rightSide?.type === 'rook' && rightSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x+1), y), oppositeColor(piece.color), game.pieces) &&
                !isSquareAttacked(coordsToSquare((x+2), y), oppositeColor(piece.color), game.pieces) &&
                !getPieceAtSquare(coordsToSquare((x+1), y), game.pieces) && 
                !getPieceAtSquare(coordsToSquare((x+2), y), game.pieces))
            { 
                safeMoves.push({
                    pieceId: piece.id,
                    from: piece.position,
                    to: coordsToSquare(x+2, y)
                });
            }
        }   

        if(leftSide?.type === 'rook' && leftSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x-1), y), oppositeColor(piece.color), game.pieces) &&
                !isSquareAttacked(coordsToSquare((x-2), y), oppositeColor(piece.color), game.pieces) &&
                !getPieceAtSquare(coordsToSquare((x-1), y), game.pieces) && 
                !getPieceAtSquare(coordsToSquare((x-2), y), game.pieces) &&
                !getPieceAtSquare(coordsToSquare((x-3), y), game.pieces))
            {
                safeMoves.push({
                    pieceId: piece.id,
                    from: piece.position,
                    to: coordsToSquare(x-2, y)
                });
            }
        }
    }

    return safeMoves;
}

export function getValidMoves(color: PieceColor, game: GameState): Record<string, Move[]> {
    const validMoves: Record<string, Move[]> = {};

    for(const piece of game.pieces) {
        if(piece.color === color) {
            validMoves[piece.id] = getPieceValidMoves(piece, game);
        };
    }

    return validMoves;
}

export function isSquareAttacked(square: Square, byColor: PieceColor, pieces: Piece[]): boolean {
    const { x: squareX, y: squareY } = squareToCoords(square);

    // Отдельная проверка на атаку пешкой
    const pawnDirection = byColor === 'black' ? 1 : -1;
    const targetY = squareY + pawnDirection;

    for (const dx of [-1, 1]) {
        const ax = squareX + dx;

        if(isWithinBoard(ax, targetY)) {
            const attackSquare = coordsToSquare(ax, targetY);
            const piece = getPieceAtSquare(attackSquare, pieces);
            if (piece?.color === byColor && piece.type === 'pawn') {
                return true;
            }
        }
    }

    // Все возможные направления атаки кроме пешек
    const attackConfigs = [

        { dirs: 'knight' as PieceType, 
            check: (p: Piece) => p.type === 'knight', 
            maxSteps: 1 },

        { dirs: 'king' as PieceType,
          check: (p: Piece) => p.type === 'king', 
          maxSteps: 1 },
        
        { dirs: 'rook' as PieceType, 
          check: (p: Piece) => ['rook', 'queen'].includes(p.type), 
          maxSteps: MAX_RAY_STEPS },
        
        { dirs: 'bishop' as PieceType, 
          check: (p: Piece) => ['bishop', 'queen'].includes(p.type), 
          maxSteps: MAX_RAY_STEPS }
    ];
    
    for (const config of attackConfigs) {
        if (checkAttackDirections(squareX, squareY, byColor, pieces, config)) {
            return true;
        }
    }
    
    return false;
}

export function isKingInCheck(color: PieceColor, pieces: Piece[]): boolean {
    const king = pieces.find(p => p.type === 'king' && p.color === color);
    if(king) return isSquareAttacked(king.position, oppositeColor(color), pieces);
    return false;
}

function checkAttackDirections(
    x: number, 
    y: number, 
    byColor: PieceColor, 
    pieces: Piece[],
    config: { dirs: PieceType, check: (piece: Piece) => boolean, maxSteps: number }
): boolean {
    for (const [dx, dy] of getPieceDirections(config.dirs)) {
        let steps = 1;
        
        while (steps <= config.maxSteps) {
            const newX = x + steps * dx;
            const newY = y + steps * dy;
            
            if (!isWithinBoard(newX, newY)) break;
            
            const piece = getPieceAtSquare(coordsToSquare(newX, newY), pieces);
            
            if (piece) {
                if (piece.color === byColor && config.check(piece)) {
                    return true;
                }
                
                if (config.maxSteps === MAX_RAY_STEPS) break;
            }
            
            if (steps === config.maxSteps) break;
            steps++;
        }
    }
    
    return false;
}

function getPawnMoves(piece: Piece, pieces: Piece[], game: GameState): Move[] {
    const moves: Move[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);
    
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;
    
    
    const oneStepY = fromY + direction;
    if (isWithinBoard(fromX, oneStepY)) {
        const oneStepSquare = coordsToSquare(fromX, oneStepY);
        if (!getPieceAtSquare(oneStepSquare, pieces)) {
            moves.push({
                pieceId: piece.id,
                from: piece.position,
                to: oneStepSquare
            });
            if (fromY === startRank) {
                const twoStepY = fromY + 2 * direction;
                const twoStepSquare = coordsToSquare(fromX, twoStepY);
                const middleSquare = coordsToSquare(fromX, oneStepY);
                
                if (!getPieceAtSquare(twoStepSquare, pieces) && 
                    !getPieceAtSquare(middleSquare, pieces)) {
                        moves.push({
                            pieceId: piece.id,
                            from: piece.position,
                            to: twoStepSquare
                        });
                }
            }
        }
    }
    
    const takeMoves = [
        { x: fromX - 1, y: fromY + direction },
        { x: fromX + 1, y: fromY + direction }
    ];
    
    for (const { x, y } of takeMoves) {
        if (isWithinBoard(x, y)) {
            const targetSquare = coordsToSquare(x, y);
            const targetPiece = getPieceAtSquare(targetSquare, pieces);
            if ((targetPiece && targetPiece.color !== piece.color)) {
                moves.push({
                    pieceId: piece.id,
                    from: piece.position,
                    to: targetSquare,
                    capturedPiece: targetPiece
                });
            }
            if(getEnPasaunt(piece, targetSquare, game)) {
                moves.push({
                    pieceId: piece.id,
                    from: piece.position,
                    to: targetSquare,
                    capturedPiece: getPieceAtSquare(coordsToSquare(x, y + (piece.color === 'white' ? -1 : 1)), game.pieces),
                    enPasaunt: true
                });
            }
        }
    }

    
    
    return moves;
}

function isWithinBoard(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

export function getPieceAtSquare(square: Square, pieces: Piece[]): Piece | undefined {
    return pieces.find(piece => piece.position === square);
}

function getPieceDirections(type: PieceType): [number, number][] {
    switch(type) {
        case 'king':
        case 'queen':
            return [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

        case 'rook':
            return [
                [-1, 0], [1, 0],
                [0, -1], [0, 1]
            ];

        case 'bishop':
            return [
                [-1, -1], [-1, 1],
                [1, -1], [1, 1]
            ];

        case 'knight':
            return [
                [-2, -1], [-2, 1],
                [-1, -2], [-1, 2],
                [1, -2], [1, 2],
                [2, -1], [2, 1]
            ];

        default:
            return [];
    }
}

export function oppositeColor(color: PieceColor): PieceColor {
    return color === 'white' ? 'black' : 'white';
}

export function makeMove(game: GameState, selectedPiece: Piece, move: Move): GameState {

    const newPieces = simulateMove(game.pieces, selectedPiece, move.to);
    
    const nextTurn = oppositeColor(game.turn);
    const isCheck = isKingInCheck(nextTurn, newPieces);
    
    const newValidMoves = getValidMoves(nextTurn, {...game, pieces: newPieces});
    
    
    const hasAnyMove = Object.values(newValidMoves).some(m => m.length > 0);
    const checkmate = !hasAnyMove && isCheck;
    const stalemate = !hasAnyMove && !isCheck;
    
    
    const capturedPiece = getPieceAtSquare(move.to, game.pieces);
    selectedPiece.hasMoved = true;

    if(move.enPasaunt === true) {
        return {
            ...game,
            pieces: newPieces.filter(p => p !== move.capturedPiece),
            turn: nextTurn,
            validMoves: newValidMoves,
            check: isCheck ? nextTurn : null,
            checkmate: checkmate,
            stalemate: stalemate
        }
    }
    
    return {
        ...game,
        pieces: newPieces,
        turn: nextTurn,
        validMoves: newValidMoves,
        check: isCheck ? nextTurn : null,
        checkmate: checkmate,
        stalemate: stalemate
    };
}

function simulateMove(pieces: Piece[], piece: Piece, targetSquare: Square): Piece[] {

    const newPieces = pieces.filter(p => p.position !== targetSquare);
    
    if (piece.type === 'king') {
        const kingX = squareToCoords(piece.position).x;
        const kingY = squareToCoords(piece.position).y;
        const targetX = squareToCoords(targetSquare).x;
        
        if (Math.abs(targetX - kingX) === 2) {
            const isQueenside = targetX < kingX; // Это длинная рокировка?
            const rookFile = isQueenside ? 0 : 7;
            const rookTargetX = isQueenside ? targetX + 1 : targetX - 1;
            
            return newPieces.map(p => {
                
                if (p.id === piece.id) {
                    return { ...p, position: targetSquare, hasMoved: true };
                }
                
                
                if (p.type === 'rook' && 
                    p.color === piece.color && 
                    !p.hasMoved &&
                    squareToCoords(p.position).x === rookFile &&
                    squareToCoords(p.position).y === kingY) {
                    
                    return { 
                        ...p, 
                        position: coordsToSquare(rookTargetX, kingY), 
                        hasMoved: true 
                    };
                }
                
                return p;
            });
        }
    }
    
    
    return newPieces.map(p => 
        p.id === piece.id 
            ? { ...p, position: targetSquare, hasMoved: true }
            : p
    );
}

export function getEnPasaunt(piece: Piece | null, square: Square, game: GameState): boolean {

    if(!piece) return false;
    if(piece.type !== 'pawn') return false;
    if(game.moveHistory.length === 0) return false;
    if(getPieceAtSquare(square, game.pieces)) return false;

    const checkingSquare = `${square[0]}${Number(square[1]) + (piece.color === 'white' ? -1 : 1)}` as Square;
    if(!isWithinBoard(squareToCoords(checkingSquare).x, squareToCoords(checkingSquare).y)) return false;

    const enPasaunt = getPieceAtSquare(checkingSquare, game.pieces);
    if(!enPasaunt || enPasaunt.type !== 'pawn') return false;


    const lastMove = game.moveHistory[game.moveHistory.length-1];
    if(!lastMove) return false;

    const isDoubleMove = Math.abs(squareToCoords(lastMove.to).y-squareToCoords(lastMove.from).y) === 2;

    if (lastMove.pieceId === enPasaunt.id && isDoubleMove && enPasaunt.color !== piece.color) {
        return true;
    }

    return false;
}