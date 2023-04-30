import { useCallback, useEffect } from "react";
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
        position: { x: index * 350, y: 250 },
      };

      const processorNodes = state.processors.map(
        (processor, processorIndex) => ({
          id: `${state.name}-${processor.processor_name}`,
          type: "customProcessor",
          data: {
            _id: processor._id, // Add the _id property to the processor node
            processor_name: processor.processor_name,
            processor_data: processor.processor_data,
            type: "processorNode",
          },
          position: { x: index * 350, y: 500 + processorIndex * 250 },
        })
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

    const processorEdges = state.processors.map((processor, processorIndex) => {
      if (processorIndex === 0) {
        return {
          id: `${state.name}-${processor.processor_name}`,
          source: state.name,
          target: `${state.name}-${processor.processor_name}`,
        };
      } else {
        const previousProcessor = state.processors[processorIndex - 1];
        return {
          id: `${previousProcessor.processor_name}-${processor.processor_name}`,
          source: `${state.name}-${previousProcessor.processor_name}`,
          target: `${state.name}-${processor.processor_name}`,
        };
      }
    });

    return [stateToChatbotEdge, ...processorEdges];
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesFromStates);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
