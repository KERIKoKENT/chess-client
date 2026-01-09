import React from 'react';
import { Piece, PieceType, PieceColor } from '../../types/chess';
import './EndgamePopup.css';


interface EndgamePopupProps {
    checkmate: PieceColor | null,
    stalemate: boolean | null,
    onNewGame: () => void
}

const EndgamePopup: React.FC<EndgamePopupProps> = ({ checkmate, stalemate, onNewGame }) => {
    if (!checkmate && !stalemate) return null;

    return (
        <div className="endgame-popup-overlay">
            <div className="endgame-popup">
                <h2
                    className={`endgame-popup-title ${
                    checkmate === 'white'
                        ? 'checkmate-white'
                        : checkmate === 'black'
                            ? 'checkmate-black'
                            : ''
                    } ${stalemate ? 'stalemate' : ''}`}
        >
                {checkmate && 'Checkmate'}
                {stalemate && 'Stalemate'}
            </h2>

            <p className="endgame-popup-subtitle">
                {checkmate === 'white' && 'White wins by checkmate'}
                {checkmate === 'black' && 'Black wins by checkmate'}
                {stalemate && 'Draw by stalemate'}
            </p>

            <div className="endgame-popup-buttons">
                <button className="popup-btn new-game" onClick={onNewGame}>
                    New Game
                </button>
            </div>
        </div>
    </div >
  );
}

export default EndgamePopup;