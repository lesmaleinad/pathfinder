var nodeGrid = {
	x: 3,
	y: 3,
	$: $('#nodeGrid'),
	list: [],
	diag: false,

	change: function () {
		nodeGrid.x = Number($('#inputX').val());
		nodeGrid.y = Number($('#inputY').val());
		nodeGrid.list = [];
		nodeGrid.$.html(function(){
			var gridYDivs = ""
			for(e=0;e<nodeGrid.y;e++){
				gridYDivs+='<div class="row row-'+e+'"></div>'}
			return gridYDivs
			})
		node.spawn(0,0);
		$('#end').text((nodeGrid.x-1).toString()+'-'+(nodeGrid.y-1).toString())
	},
};

var node = {
	$: $('#nodeGrid').find('.node'),
	html: (gx,gy)=> '<li class="node" id="n'+ gx.toString()+'-'+ gy.toString()+'" style="order:'+gy.toString()+gx.toString()+'"></li>',

	find: function(findX,findY){
		return nodeGrid.list.find(n=>n.id === findX.toString()+'-'+findY.toString())
	},

	findId: function(id){
		return node.find(Number(id.split('-')[0]), Number(id.split('-')[1]))
	},

	Node: function(x, y){
	 	this.id = x.toString()+'-'+y.toString();
	 	this.neighbors = [];
	 	this.cost = 1;
	 	this.minPath = [this];
	 	this.link = function(pushX,pushY){
	 		node.find(pushX,pushY).neighbors.push(this.id);
	 		this.neighbors.push(pushX.toString()+'-'+pushY.toString());
			}
		this.nArray = function(){
			var arr = [];
			this.neighbors.forEach(z=>arr.push(node.findId(z)));
			return arr
			}	
		},

	spawn: function(gridX,gridY){
		var gx = gridX;
		var gy = gridY;
		// APPEND ITSELF
		nodeGrid.list.push(new node.Node(gx,gy))
		nodeGrid.$.find('.row:nth-of-type('+(gy+1)+')').append(node.html(gx,gy))
		// FIND/SPAWN X [link self]
		gx++
		// FIND X AND LINK
		if (node.find(gx,gy) !== undefined){
			node.find(gx-1,gy).link(gx,gy);
			}
		// SPAWN X AND LINK
		else if (gx < nodeGrid.x){
			node.spawn(gx, gy);
			node.find(gx-1,gy).link(gx,gy)
		}
		gx--
		// SPAWN Y [link self]
		gy++
		if (gy < nodeGrid.y){
			node.spawn(gx, gy);
			node.find(gx,gy-1).link(gx,gy)
		}
		gy--;
		nodeGrid.diag ? node.diagsLink(gx,gy) :{};
	},

	diagsLink: function(x,y){
		// LINK UP AND RIGHT
		node.find(x+1, y-1) !== undefined ? node.find(x,y).link(x+1,y-1) : {};
		node.find(x+1, y+1) !== undefined ? node.find(x,y).link(x+1,y+1) : {};

	}
};

var path = {
	tentative: [],

	findCost: function(node){
		var d = 0;
		node.minPath.forEach(n=>d+=n.cost);
		return d},

	findMinCost: function(nodeArray){
		var minCost = 9999;
		var minNode = {};
		nodeArray.forEach(function(id){
				var test = path.findCost(id);
				if(minCost>test){
					minCost=test; minNode=id}
				})
		return minNode
	},

	find: function(startNode, endNode){
		// MARK NODES AS UNVISITED
		$('li').removeClass('path')
		nodeGrid.list.forEach(x=>{x.minPath=[x]});
		path.tentative = startNode.nArray().slice();
		var nextNode = startNode;
		// REPEAT THE FOLLOWING:
			while(nextNode !== endNode){
		// CALCULATE DISTANCES FROM CURRENT NODE TO TENTATIVE NEIGHBORS
		nextNode.nArray().forEach(function(n){
			if (n.minPath.length === 1 ||
				path.findCost(n) > path.findCost(nextNode) + n.cost)
				{n.minPath = nextNode.minPath.concat([n]);
					path.tentative.push(n)}
		});
		// VISIT CURRENT NODE
		for(i=0;i<=path.tentative.indexOf(nextNode);){
			path.tentative.splice(path.tentative.indexOf(nextNode),1);
		}

		// FIND MINIMUM COST OF TENTATIVE NEIGHBOR NODES
		nextNode = path.findMinCost(path.tentative);
		}
		nextNode.minPath.forEach(n=>$('#n'+n.id).addClass('path'))
		return nextNode.minPath
	}
};

var lightgrey = 1;
var yellow = 3;
var red = 10;

var randomCost = function(){
	nodeGrid.list.forEach(function(n){
		$('li').removeClass('path')
		num = [1,3,10][(Math.floor(Math.random() * 3))];
		n.cost = num;
		$('#n'+n.id).css('background-color', num === 1 ? 'lightgrey' : num===3 ? 'yellow' : num === 10 ? 'red' : {});
	})
}

$('.gridSize input[type="number"]').change(nodeGrid.change);
$('#randomCost').click(randomCost);
$('#findPath').click(function(){
	path.find(node.find(0,0),node.find(nodeGrid.x-1,nodeGrid.y-1))
})
$('#diag').change(function(){
	nodeGrid.diag = $('#diag').prop('checked');
	nodeGrid.change()
	})
nodeGrid.change()