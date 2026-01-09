import { getValidMoves } from "../utils/gameLogic"

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
    position: Square
}

export interface GameState {
    pieces: Piece[],
    turn: PieceColor,
    validMoves: Record<string, Move[]>,
    moveHistory: Move[],
    check: PieceColor | null,
    checkmate: boolean,
    stalemate: boolean,
    promotionMenu: PromotionState
}

export interface Move {
    pieceId: string,
    from: Square,
    to: Square,
    capturedPiece?: Piece | undefined,
    enPasaunt?: boolean,
    promotion?: boolean
}

export interface PromotionState {
    piece: Piece | null,
    targetSquare: Square | null,
    visible: boolean
}

export interface DragState {
    piece: Piece | null,
    fromSquare: Square | null,
    offsetX: number,
    offsetY: number,
    x: number,
    y: number
}

export function startGame():
    GameState {
    return {
        pieces: INIT_POS,
        turn: 'white' as PieceColor,
        validMoves: {
            "wP1": [
                { pieceId: 'wP1', from: 'a2', to: 'a3' },
                { pieceId: 'wP1', from: 'a2', to: 'a4' }
            ],
            "wP2": [
                { pieceId: 'wP2', from: 'b2', to: 'b3' },
                { pieceId: 'wP2', from: 'b2', to: 'b4' }
            ],
            "wP3": [
                { pieceId: 'wP3', from: 'c2', to: 'c3' },
                { pieceId: 'wP3', from: 'c2', to: 'c4' }
            ],
            "wP4": [
                { pieceId: 'wP4', from: 'd2', to: 'd3' },
                { pieceId: 'wP4', from: 'd2', to: 'd4' }
            ],
            "wP5": [
                { pieceId: 'wP5', from: 'e2', to: 'e3' },
                { pieceId: 'wP5', from: 'e2', to: 'e4' }
            ],
            "wP6": [
                { pieceId: 'wP6', from: 'f2', to: 'f3' },
                { pieceId: 'wP6', from: 'f2', to: 'f4' }
            ],
            "wP7": [
                { pieceId: 'wP7', from: 'g2', to: 'g3' },
                { pieceId: 'wP7', from: 'g2', to: 'g4' }
            ],
            "wP8": [
                { pieceId: 'wP8', from: 'h2', to: 'h3' },
                { pieceId: 'wP8', from: 'h2', to: 'h4' }
            ],

            "wN1": [
                { pieceId: 'wN1', from: 'b1', to: 'a3' },
                { pieceId: 'wN1', from: 'b1', to: 'c3' }
            ],
            "wN2": [
                { pieceId: 'wN2', from: 'g1', to: 'f3' },
                { pieceId: 'wN2', from: 'g1', to: 'h3' }
            ],

            "wB1": [], 
            "wB2": [],
            "wR1": [], 
            "wR2": [],
            "wQ": [], 
            "wK": []
        },
        moveHistory: [],
        check: null,
        checkmate: false,
        stalemate: false,
        promotionMenu: {
            piece: null,
            targetSquare: null,
            visible: false
        }
    }
}

export const INIT_POS: Piece[] = [
    { id: 'wR1', type: 'rook', color: 'white', position: 'a1' },
    { id: 'wN1', type: 'knight', color: 'white', position: 'b1' },
    { id: 'wB1', type: 'bishop', color: 'white', position: 'c1' },
    { id: 'wQ', type: 'queen', color: 'white', position: 'd1' },
    { id: 'wK', type: 'king', color: 'white', position: 'e1' },
    { id: 'wB2', type: 'bishop', color: 'white', position: 'f1' },
    { id: 'wN2', type: 'knight', color: 'white', position: 'g1' },
    { id: 'wR2', type: 'rook', color: 'white', position: 'h1' },

    { id: 'wP1', type: 'pawn', color: 'white', position: 'a2' },
    { id: 'wP2', type: 'pawn', color: 'white', position: 'b2' },
    { id: 'wP3', type: 'pawn', color: 'white', position: 'c2' },
    { id: 'wP4', type: 'pawn', color: 'white', position: 'd2' },
    { id: 'wP5', type: 'pawn', color: 'white', position: 'e2' },
    { id: 'wP6', type: 'pawn', color: 'white', position: 'f2' },
    { id: 'wP7', type: 'pawn', color: 'white', position: 'g2' },
    { id: 'wP8', type: 'pawn', color: 'white', position: 'h2' },


    { id: 'bR1', type: 'rook', color: 'black', position: 'a8' },
    { id: 'bN1', type: 'knight', color: 'black', position: 'b8' },
    { id: 'bB1', type: 'bishop', color: 'black', position: 'c8' },
    { id: 'bQ', type: 'queen', color: 'black', position: 'd8' },
    { id: 'bK', type: 'king', color: 'black', position: 'e8' },
    { id: 'bB2', type: 'bishop', color: 'black', position: 'f8' },
    { id: 'bN2', type: 'knight', color: 'black', position: 'g8' },
    { id: 'bR2', type: 'rook', color: 'black', position: 'h8' },

    { id: 'bP1', type: 'pawn', color: 'black', position: 'a7'},
    { id: 'bP2', type: 'pawn', color: 'black', position: 'b7' },
    { id: 'bP3', type: 'pawn', color: 'black', position: 'c7' },
    { id: 'bP4', type: 'pawn', color: 'black', position: 'd7' },
    { id: 'bP5', type: 'pawn', color: 'black', position: 'e7' },
    { id: 'bP6', type: 'pawn', color: 'black', position: 'f7' },
    { id: 'bP7', type: 'pawn', color: 'black', position: 'g7' },
    { id: 'bP8', type: 'pawn', color: 'black', position: 'h7' }
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