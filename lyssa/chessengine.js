var board;
var game = new Chess();
//var i = 0; //Loop variable
function bestMoveGenerator(depth,game,isMaximising)
{
		var bestMove;
    var bestMoveScore=-9999  //Starting with the lowest value for the bestMoveScore
    var newGameMoves = game.ugly_moves(); //ugly_moves is an attribute in the chess.js file that stores all the generated moves
    for(var i=0;i<newGameMoves.length;i++)
        {
            game.ugly_move(newGameMoves[i]);
            var score = minimax(depth-1,game,-10000,10000,!isMaximising)
            game.undo(); //Taking the move back after checking
            if(score>bestMoveScore)
                {
                    bestMoveScore = score;
                    bestMove = newGameMoves[i];
                }
        }
    return bestMove;
}

function minimax(depth,game,alpha,beta,isMaximising)
{
		positionCount++;
    if(depth === 0 || game.game_over())
        {
            return -evalBoard(game.board()); 
        }
    var gameMoves = game.ugly_moves();
    if(isMaximising)
        {
            var maxEval = -9999;
            for(var i=0;i<gameMoves.length;i++)
                {
                    game.ugly_move(gameMoves[i]);
                    maxEval = Math.max(maxEval,minimax(depth-1,game,alpha,beta,!isMaximising))
                    game.undo();
                    alpha = Math.max(maxEval,alpha);
                    if(beta<=alpha)
                        {
                            return maxEval;
                        }
                }
            return maxEval;
        }
    else
        {
            var minEval = 9999;
            for(var i=0;i<gameMoves.length;i++)
                {
                    game.ugly_move(gameMoves[i])
                    minEval= Math.min(minEval,minimax(depth-1,game,alpha,beta, !isMaximising))
                    game.undo();
                    beta = Math.min(minEval,beta);
                    if(beta<=alpha)
                        {
                            return minEval;
                        }
                }
            return minEval;
        }
}
function evalBoard(board)
{
    var totalEval = 0;
    for(var i=0;i<8;i++)
        { 
            //var j;  //Loop variable
            for(var j=0; j<8;j++)
                {
                   totalEval+= getPieceValue(board[i][j], i , j); 
                }
        }
    return totalEval;
}
function flippedBoardEval(array)  //To find the flipped board evaluation of black pieces
{
    return array.slice().reverse();
}
//Position evaluation look up table for each piece

//Pawn
var pawnEvalWhite = [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];
var pawnEvalBlack = flippedBoardEval(pawnEvalWhite);
//Knight 
var knightEval = [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];
//No need for different square tables for different colours since knight square table is same flipped.
//Bishop
var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];
var bishopEvalBlack = flippedBoardEval(bishopEvalWhite);
//Rook
var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];
var rookEvalBlack = flippedBoardEval(rookEvalWhite)
//Queen
var queenEval = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];
//Queen has the same power on any side of the board so no need for a different table for black
var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];
var kingEvalBlack = flippedBoardEval(kingEvalWhite);


//Evaluation

function getPieceValue(piece, x ,y) //We include the position also as a parameter so we can use the piece square look up table
{
    if(piece === null)
        {
            return 0;
        }
    function getAbsolutePieceValue(piece, isWhite, x, y) //Nested function 
    {
        if(piece.type==='p')
            {
                return 10 + (isWhite? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]) //We use (y,x) instead of (x,y) because the piece look up table has columns and rows interchanged
            }
        else if(piece.type==='n')
           {
                return 30 + (knightEval[y][x]);
           }
        else if(piece.type==='b')
           {
                return 32 + (isWhite? bishopEvalWhite[y][x]: bishopEvalBlack[y][x]); 
           }
        else if(piece.type==='r')
            {
                return 50 + (isWhite? rookEvalWhite[y][x]: rookEvalBlack[y][x]);
            }
        else if(piece.type==='q')
            {
                return 90 + (queenEval[y][x]);
            }
        else if(piece.type==='k')
            {
                return 900 + (isWhite? kingEvalWhite[y][x]: kingEvalBlack[y][x]);
            }
        throw "Unknown piece type:" +piece.type;
    }
    var absoluteValue = getAbsolutePieceValue(piece, piece.color==='w', x, y);
    return piece.color==='w'? absoluteValue: -absoluteValue;
}




//Display part
var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

var makeBestMove = function () {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    if (game.game_over()) {
        alert('Game over');
    }
};


var positionCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        alert('Game over');
    }

    positionCount = 0;
    var depth = 2;

    var d = new Date().getTime();
    var bestMove = bestMoveGenerator(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
    var opening = game.get_comment();
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + '     ' + ( moves[i + 1] ? moves[i + 1] : '     ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

var onDrop = function (source, target) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'  //Always promotes pawn to queen
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,
};
board = new ChessBoard('board', cfg);