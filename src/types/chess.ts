export type PieceType = 'pawn' | 'knight' | 'rook' | 'bishop' | 'queen' | 'king'
export type PieceColor = 'white' | 'black'
export type SquareColor = 'light' | 'dark'

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
export type Square = `${File}${Rank}`

export const MAX_RAY_STEPS = 7;

export interface Piece {
    id: string,
    type: PieceType,
    color: PieceColor,
    position: Square,
    hasMoved: boolean
}

export interface GameState {
    pieces: Piece[],
    turn: PieceColor,
    selectedPiece: Piece | null,
    validMoves: Square[],
    capturedPieces: Piece[],
    check: PieceColor | null,
    checkmate: boolean,
    stalemate: boolean
}

export const INIT_POS: Piece[] = [
    { id: 'wR1', type: 'rook', color: 'white', position: 'a1', hasMoved: false },
    { id: 'wN1', type: 'knight', color: 'white', position: 'b1', hasMoved: false },
    { id: 'wB1', type: 'bishop', color: 'white', position: 'c1', hasMoved: false },
    { id: 'wQ', type: 'queen', color: 'white', position: 'd1', hasMoved: false },
    { id: 'wK', type: 'king', color: 'white', position: 'e1', hasMoved: false },
    { id: 'wB2', type: 'bishop', color: 'white', position: 'f1', hasMoved: false },
    { id: 'wN2', type: 'knight', color: 'white', position: 'g1', hasMoved: false },
    { id: 'wR2', type: 'rook', color: 'white', position: 'h1', hasMoved: false },

    { id: 'wP1', type: 'pawn', color: 'white', position: 'a2', hasMoved: false },
    { id: 'wP2', type: 'pawn', color: 'white', position: 'b2', hasMoved: false },
    { id: 'wP3', type: 'pawn', color: 'white', position: 'c2', hasMoved: false },
    { id: 'wP4', type: 'pawn', color: 'white', position: 'd2', hasMoved: false },
    { id: 'wP5', type: 'pawn', color: 'white', position: 'e2', hasMoved: false },
    { id: 'wP6', type: 'pawn', color: 'white', position: 'f2', hasMoved: false },
    { id: 'wP7', type: 'pawn', color: 'white', position: 'g2', hasMoved: false },
    { id: 'wP8', type: 'pawn', color: 'white', position: 'h2', hasMoved: false },

    
    { id: 'bR1', type: 'rook', color: 'black', position: 'a8', hasMoved: false },
    { id: 'bN1', type: 'knight', color: 'black', position: 'b8', hasMoved: false },
    { id: 'bB1', type: 'bishop', color: 'black', position: 'c8', hasMoved: false },
    { id: 'bQ', type: 'queen', color: 'black', position: 'd8', hasMoved: false },
    { id: 'bK', type: 'king', color: 'black', position: 'e8', hasMoved: false },
    { id: 'bB2', type: 'bishop', color: 'black', position: 'f8', hasMoved: false },
    { id: 'bN2', type: 'knight', color: 'black', position: 'g8', hasMoved: false },
    { id: 'bR2', type: 'rook', color: 'black', position: 'h8', hasMoved: false },

    { id: 'bP1', type: 'pawn', color: 'black', position: 'a7', hasMoved: false },
    { id: 'bP2', type: 'pawn', color: 'black', position: 'b7', hasMoved: false },
    { id: 'bP3', type: 'pawn', color: 'black', position: 'c7', hasMoved: false },
    { id: 'bP4', type: 'pawn', color: 'black', position: 'd7', hasMoved: false },
    { id: 'bP5', type: 'pawn', color: 'black', position: 'e7', hasMoved: false },
    { id: 'bP6', type: 'pawn', color: 'black', position: 'f7', hasMoved: false },
    { id: 'bP7', type: 'pawn', color: 'black', position: 'g7', hasMoved: false },
    { id: 'bP8', type: 'pawn', color: 'black', position: 'h7', hasMoved: false }
]

export const files: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const ranks: Rank[] = ['1', '2', '3', '4', '5', '6', '7', '8']

export const allSquares: Square[] = [];
for (let rank of ranks) {
    for (let file of files) {
        allSquares.push(`${file}${rank}` as Square)
    }
}

export function isLightSquare(square: Square): boolean {
    const fileIndex = files.indexOf(square[0] as File)
    const rankIndex = parseInt(square[1]) - 1
    return (fileIndex + rankIndex) % 2 === 0
}

export function squareToCoords(square: Square): { x: number, y: number } {
        const file = square[0] as File;
        const rank = square[1] as Rank;
        return {
            x: files.indexOf(file),
            y: ranks.indexOf(rank) 
        }
}

export function coordsToSquare(x: number, y: number): Square {
    return `${files[x]}${ranks[y]}` as Square;
}