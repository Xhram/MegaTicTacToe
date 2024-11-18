self.importScripts("../game.js");
onmessage = function (e) {
	console.log("AI instantiated in web worker thread");
	makeMove(GameState.manualClone(e.data[0]), e.data[1], postMessage);
};

/**
 * Has the AI pick its move.
 *
 * @param {GameState} state The current state of the game, with the AI's turn to move
 * @param {number} level The difficulty of the AI [0-2]
 * @param {Function} callback The function to pass the picked move into
 */
function makeMove(state, level, callback) {
	switch (level) {
		case 0:
			setTimeout(function () {
				callback([randomPick(state, false)[0], 0, 0]);
			}, 1000);
			return;
		case 1:
			callback(mcts(state, false));
			return;
		case 2:
			callback(mcts(state, true));
			return;
	}
}

/**
 * Pick a random valid move to make
 *
 * @param {GameState} state The current state of the game, with the AI's turn to move
 * @param {boolean} enumerate Whether to return all possible moves or just one
 * @returns {number[][]} The coordinates to move
 */
function randomPick(state, enumerate) {
	
	function pick(board, isValid) {
		const options = [];
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (isValid(board[i][j])) {
					options[options.length] = [i, j];
				}
			}
		}
		
		return enumerate ? options : options[Math.floor(Math.random() * options.length)];
	}
	
	if (state.lastMove) {
		// Restricted Choice
		const a = state.lastMove[0];
		const b = state.lastMove[1];
		
		return processSmallBoard(a, b);
	}
	
	// Free Choice
	const board = pick(state.board, x => Array.isArray(x));
	
	if (enumerate) {
		let ret = [];
		for (const x of board) {
			ret = ret.concat(processSmallBoard(x[0], x[1]));
		}
		return ret;
	}
	
	return processSmallBoard(board[0], board[1]);
	
	
	function processSmallBoard(a, b) {
		const choice = pick(state.board[a][b], x => x === null);
		if (enumerate) {
			return choice.map(x => [a, b, ...x]);
		}
		return [[a, b, choice[0], choice[1]]];
	}
}

/**
 * Performs a monte carlo tree search on the current state to find the best move.
 *
 * @param {GameState} state The current state of the game, with the AI's turn to move
 * @param {boolean} isGood Whether the AI should really try
 * @returns {[number[], number, number]} The coordinates to move, the win rate,
 * and the number of simulations
 */
function mcts(state, isGood) {
	const tree = new TreeNode(state, null, null);
	const endTime = Date.now() + (isGood ? 5000 : 1000);
	while (Date.now() < endTime) {
		tree.runMCTS();
	}
	const best = tree.bestChild;
	console.log(`Picking node with win rate ${best.win / best.sim} using ${best.sim} sims`);
	return [best.lastMove, best.win / best.sim, tree.sim];
}

/**
 * The exploration parameter
 * @type {number}
 */
const EXPLORE = Math.sqrt(2);

/**
 * A node in the Monte-Carlo Tree Search tree.
 */
class TreeNode {
	
	/**
	 * Constructs a new tree node for MCTS.
	 *
	 * @param {GameState} state The state of the game at this node; probably a good
	 *                          idea to clone before passing it in
	 * @param {?TreeNode} parent The parent of this node
	 * @param {?(number[])} lastMove The move made from the parent to this node
	 */
	constructor(state, parent, lastMove) {
		/**
		 * The state of the game at this node
		 * @type {GameState}
		 */
		this.state = state;
		
		/**
		 * The parent of this node
		 * @type {?TreeNode}
		 */
		this.parent = parent;
		
		/**
		 * The move made from the parent to this node
		 * @type {?(number[])}
		 */
		this.lastMove = lastMove;
		
		/**
		 * The number of wins from this node. This win rate is with respect to
		 * the player that JUST moved, not the player currently up to move
		 * according to the state variable.
		 * @type {number}
		 */
		this.win = 0;
		
		/**
		 * The number of simulations run from this node
		 * @type {number}
		 */
		this.sim = 0;
		
		/**
		 * The children states of this node that have been expanded
		 * @type {TreeNode[]}
		 */
		this.children = [];
		
		/**
		 * All unexplored child states of this node
		 * @type {number[][]}
		 */
		this.allChildren = randomPick(state, true);
	}
	
	/**
	 * Get the UCT value of this node
	 * @returns {number}
	 */
	get uct() {
		if (this.parent === null) {
			return this.win / this.sim;
		}
		return (this.win / this.sim) +
			EXPLORE * Math.sqrt(Math.log(this.parent.sim) / this.sim);
	}
	
	/**
	 * Get the child node with the highest UCT to select during phase 1.
	 * @returns {?TreeNode} The child node to expand to, or null if we've reached the bottom
	 */
	get selection() {
		if (this.children.length === 0) {
			return null;
		}
		return this.children.reduce((a, x) => {
			return x.uct > a.uct ? x : a;
		}, this.children[0]);
	}
	
	/**
	 * Pick the best child node to play from this node
	 * @returns {?TreeNode} The best child node, or null if this node has no children
	 */
	get bestChild() {
		if (this.children.length === 0) {
			return null;
		}
		return this.children.reduce((a, x) => {
			return x.sim > a.sim ? x : a;
		}, this.children[0]);
	}
	
	/**
	 * Performs MCTS by selecting the best node, expanding one move from this node randomly
	 * and simulating a random game to completion before backpropagating all the information.
	 * <br>
	 * Has no effect if this is a terminal node.
	 */
	runMCTS() {
		if (this.state.status !== true) {
			return;
		}
		
		/**
		 * Back propagate a win amount up all a node's parents (stage 4)
		 * @param {TreeNode} node The node to start propagating from
		 * @param {GameState} win The state of the game when played to competion from this node
		 */
		function backProp(node, win) {
			let n = node;
			while (n !== null) {
				n.sim++;
				// noinspection JSIncompatibleTypesComparison
				if (win.status === null) {
					n.win += 0.5;
				} else if (n.state.status !== true) {
					// noinspection JSIncompatibleTypesComparison
					n.win += n.state.status === null ? 0.5 : 1;
				} else {
					n.win += win.turn !== n.state.turn ? 1 : 0;
				}
				n = n.parent;
			}
		}
		
		
		let child = this;
		while (child.allChildren.length === 0) {
			const sel = child.selection;
			if (sel === null) {
				break;
			}
			child = sel;
		}
		
		const state = child.state;
		
		if (state.status !== true) {
			backProp(child, state);
			return;
		}
		
		// Make a random move first
		const move = child.allChildren.pop();
		const newState = state.clone();
		newState.move(...move);
		
		// Create one child node (phase 2 expand)
		const newChild = new TreeNode(newState, child, move);
		child.children.push(newChild);
		
		// Play the game to completion randomly (phase 3 simulate)
		let currState = newState.clone();
		while (currState.status === true) {
			currState.move(...(randomPick(currState, false)[0]));
		}
		
		// Propagate that information back up through all the parents (stage 4 backprop)
		backProp(newChild, currState);
	}
	
}