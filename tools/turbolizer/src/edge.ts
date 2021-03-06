// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { GNode, DEFAULT_NODE_BUBBLE_RADIUS } from "../src/node"
import { Graph } from "./graph";

export const MINIMUM_EDGE_SEPARATION = 20;

export class Edge {
  target: GNode;
  source: GNode;
  index: number;
  type: string;
  backEdgeNumber: number;
  visible: boolean;

  constructor(target: GNode, index: number, source: GNode, type: string) {
    this.target = target;
    this.source = source;
    this.index = index;
    this.type = type;
    this.backEdgeNumber = 0;
    this.visible = false;
  }

  stringID() {
    return this.source.id + "," + this.index + "," + this.target.id;
  };

  isVisible() {
    return this.visible && this.source.visible && this.target.visible;
  };

  getInputHorizontalPosition(graph: Graph, showTypes: boolean) {
    if (this.backEdgeNumber > 0) {
      return graph.maxGraphNodeX + this.backEdgeNumber * MINIMUM_EDGE_SEPARATION;
    }
    var source = this.source;
    var target = this.target;
    var index = this.index;
    var input_x = target.x + target.getInputX(index);
    var inputApproach = target.getInputApproach(this.index);
    var outputApproach = source.getOutputApproach(showTypes);
    if (inputApproach > outputApproach) {
      return input_x;
    } else {
      var inputOffset = MINIMUM_EDGE_SEPARATION * (index + 1);
      return (target.x < source.x)
        ? (target.x + target.getTotalNodeWidth() + inputOffset)
        : (target.x - inputOffset)
    }
  }

  generatePath(graph: Graph, showTypes: boolean) {
    var target = this.target;
    var source = this.source;
    var input_x = target.x + target.getInputX(this.index);
    var arrowheadHeight = 7;
    var input_y = target.y - 2 * DEFAULT_NODE_BUBBLE_RADIUS - arrowheadHeight;
    var output_x = source.x + source.getOutputX();
    var output_y = source.y + source.getNodeHeight(showTypes) + DEFAULT_NODE_BUBBLE_RADIUS;
    var inputApproach = target.getInputApproach(this.index);
    var outputApproach = source.getOutputApproach(showTypes);
    var horizontalPos = this.getInputHorizontalPosition(graph, showTypes);

    var result = "M" + output_x + "," + output_y +
      "L" + output_x + "," + outputApproach +
      "L" + horizontalPos + "," + outputApproach;

    if (horizontalPos != input_x) {
      result += "L" + horizontalPos + "," + inputApproach;
    } else {
      if (inputApproach < outputApproach) {
        inputApproach = outputApproach;
      }
    }

    result += "L" + input_x + "," + inputApproach +
      "L" + input_x + "," + input_y;
    return result;
  }

  isBackEdge() {
    return this.target.hasBackEdges() && (this.target.rank < this.source.rank);
  }

}

export const edgeToStr = (e: Edge) => e.stringID();
