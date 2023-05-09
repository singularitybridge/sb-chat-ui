import { useCallback, useEffect, useState } from "react";
import React, { memo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";
import { CustomNode } from "./custom-nodes/CustomNodeChatbot";
import { CustomNodeState } from "./custom-nodes/CustomNodeState";
import { CustomNodeProcessor } from "./custom-nodes/CustomNodeProcessor";

import { Chatbot } from "../../../services/ChatbotService";

interface ActionsViewProps {
  chatbot: Chatbot;
  onNodeSelected: (node: any, type: string) => void;
}

const nodeTypes = {
  custom: memo(CustomNode),
  customState: memo(CustomNodeState),
  customProcessor: memo(CustomNodeProcessor),
};

const ActionsView: React.FC<ActionsViewProps> = ({
  chatbot,
  onNodeSelected,
}) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (event: any, node: any) => {
    if (node.type === "custom") {
      onNodeSelected(node.data, "chatbotNode");
    }
    if (node.type === "customState") {
      onNodeSelected(node.data, "stateNode");
    }
    if (node.type === "customProcessor") {
      onNodeSelected(node.data, "processorNode");
    }
  };

  const reactFlow = useReactFlow();
  const { setViewport } = reactFlow;

  useEffect(() => {
    setViewport({ x: 0, y: 0, zoom: 0.7 }, { duration: 600 });
  }, [setViewport]);

  useEffect(() => {
    const chatbotNode = {
      id: chatbot.name,
      type: "custom",
      data: {
        name: chatbot.name,
        description: chatbot.description,
        avatarImage: chatbot.avatarImage,
        backgroundImage: chatbot.backgroundImage,
        maxTokens: chatbot.maxTokens,
        key: chatbot.key,
        type: "chatbotNode",
      },
      position: { x: (chatbot.states.length * 300) / 2, y: 50 },
    };

    const nodesFromStates = chatbot.states.reduce<any[]>(
      (acc, state, index) => {
        const isActive = chatbot.current_state === state.name;
        const stateNode = {
          id: state.name,
          type: "customState",
          data: {
            _id: state._id,
            name: state.name,
            prompt: state.prompt,
            model: state.model,
            temperature: state.temperature,
            type: "stateNode",
            isActive,
          },
          position: { x: index * 370 + 450, y: 300 },
        };

        const processorNodes = state.processors.map(
          (processor, processorIndex) => {
            const processorHeight = 400;
            const positionY = 600 + (processorHeight + 110) * processorIndex;

            return {
              id: `${state.name}-${processor._id}`,
              type: "customProcessor",
              data: {
                _id: processor._id,
                processor_name: processor.processor_name,
                processor_data: processor.processor_data,
                type: "processorNode",
              },
              position: { x: index * 370 + 495, y: positionY },
            };
          }
        );

        return [...acc, stateNode, ...processorNodes];
      },
      [chatbotNode]
    );

    const initEdges = chatbot.states.flatMap((state) => {
      const stateToChatbotEdge = {
        id: `${chatbot.name}-${state.name}`,
        source: chatbot.name,
        target: state.name,
      };

      const processorEdges = state.processors.map(
        (processor, processorIndex) => {
          if (processorIndex === 0) {
            return {
              id: `${state.name}-${processor._id}`,
              source: state.name,
              target: `${state.name}-${processor._id}`,
            };
          } else {
            const previousProcessor = state.processors[processorIndex - 1];
            return {
              id: `${previousProcessor._id}-${processor._id}`,
              source: `${state.name}-${previousProcessor._id}`,
              target: `${state.name}-${processor._id}`,
            };
          }
        }
      );

      return [stateToChatbotEdge, ...processorEdges];
    });

    setNodes(nodesFromStates);
    setEdges(initEdges);
  }, [chatbot]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      className="bg-teal-50"
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={24} size={2} />
    </ReactFlow>
  );
};

export { ActionsView };
