import { Piece, Square, PieceType, GameState, files, ranks, squareToCoords, coordsToSquare, PieceColor, MAX_RAY_STEPS } from '../types/chess';

export function getPieceValidMoves(piece: Piece, pieces: Piece[]): Square[] {
    let pieceValidMoves: Square[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);

    if (piece.type === 'pawn') {
        pieceValidMoves = getPawnMoves(piece, pieces);
    }

    const directions = getPieceDirections(piece.type);

    for (const [dx, dy] of directions) {
        if (piece.type === 'knight') {
            const newX = fromX + dx;
            const newY = fromY + dy;

            if (isWithinBoard(newX, newY)) {
                const targetSquare = coordsToSquare(newX, newY);
                const targetPiece = getPieceAtSquare(targetSquare, pieces);

                if (!targetPiece || targetPiece.color !== piece.color) {
                    pieceValidMoves.push(targetSquare);
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
                const targetPiece = getPieceAtSquare(targetSquare, pieces);
                
                if (!targetPiece) {
                    pieceValidMoves.push(targetSquare);
                }
                else if (targetPiece.color !== piece.color) {
                    pieceValidMoves.push(targetSquare);
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

    const safeMoves: Square[] = [];

    for (const move of pieceValidMoves) {
        const newBoard = simulateMove(pieces, piece, move);
    
        if (!isKingInCheck(piece.color, newBoard)) {
            safeMoves.push(move);
        }
    }

    if(piece.type === 'king' && piece.hasMoved === false) {
        const { x, y } = squareToCoords(piece.position);
        const rightSide = getPieceAtSquare(coordsToSquare(x+3, y), pieces);
        const leftSide = getPieceAtSquare(coordsToSquare(x-4, y), pieces);

        if(rightSide?.type === 'rook' && rightSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x+1), y), oppositeColor(piece.color), pieces) &&
                !isSquareAttacked(coordsToSquare((x+2), y), oppositeColor(piece.color), pieces) &&
                !getPieceAtSquare(coordsToSquare((x+1), y), pieces) && 
                !getPieceAtSquare(coordsToSquare((x+2), y), pieces))
            { 
                safeMoves.push(coordsToSquare(x+2, y)); 
            }
        }   

        if(leftSide?.type === 'rook' && leftSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x-1), y), oppositeColor(piece.color), pieces) &&
                !isSquareAttacked(coordsToSquare((x-2), y), oppositeColor(piece.color), pieces) &&
                !getPieceAtSquare(coordsToSquare((x-1), y), pieces) && 
                !getPieceAtSquare(coordsToSquare((x-2), y), pieces) &&
                !getPieceAtSquare(coordsToSquare((x-3), y), pieces))
            {
                safeMoves.push(coordsToSquare(x-2, y));
            }
        }
    }

    return safeMoves;
}

export function getValidMoves(color: PieceColor, pieces: Piece[]): Record<string, Square[]> {
    const validMoves: Record<string, Square[]> = {};

    for(const piece of pieces) {
        if(piece.color === color) {
            validMoves[piece.id] = getPieceValidMoves(piece, pieces);
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

function getPawnMoves(piece: Piece, pieces: Piece[]): Square[] {
    const moves: Square[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);
    
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;
    
    
    const oneStepY = fromY + direction;
    if (isWithinBoard(fromX, oneStepY)) {
        const oneStepSquare = coordsToSquare(fromX, oneStepY);
        if (!getPieceAtSquare(oneStepSquare, pieces)) {
            moves.push(oneStepSquare);
            if (fromY === startRank) {
                const twoStepY = fromY + 2 * direction;
                const twoStepSquare = coordsToSquare(fromX, twoStepY);
                const middleSquare = coordsToSquare(fromX, oneStepY);
                
                if (!getPieceAtSquare(twoStepSquare, pieces) && 
                    !getPieceAtSquare(middleSquare, pieces)) {
                    moves.push(twoStepSquare);
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
            
            if (targetPiece && targetPiece.color !== piece.color) {
                moves.push(targetSquare);
            }
        }
    }
    
    return moves;
}

function isWithinBoard(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function getPieceAtSquare(square: Square, pieces: Piece[]): Piece | undefined {
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

export function makeMove(game: GameState, selectedPiece: Piece, square: Square): GameState {

    const newPieces = simulateMove(game.pieces, selectedPiece, square);
    
    const nextTurn = oppositeColor(game.turn);
    const isCheck = isKingInCheck(nextTurn, newPieces);
    
    const newValidMoves = getValidMoves(nextTurn, newPieces);
    
    
    const hasAnyMove = Object.values(newValidMoves).some(m => m.length > 0);
    const checkmate = !hasAnyMove && isCheck;
    const stalemate = !hasAnyMove && !isCheck;
    
    
    const capturedPiece = getPieceAtSquare(square, game.pieces);
    
    return {
        pieces: newPieces,
        turn: nextTurn,
        validMoves: newValidMoves,
        check: isCheck ? nextTurn : null,
        checkmate: checkmate,
        stalemate: stalemate,
        moveHistory: [...game.moveHistory, {
            pieceId: selectedPiece.id,
            from: selectedPiece.position,
            to: square,
            capturedPiece
        }]
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