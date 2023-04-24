import { useCallback } from "react";
import React, { memo } from "react";
import ReactFlow, { useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./CustomNode";
import { Chatbot } from "../../services/ChatbotService";

interface ActionsViewProps {
  chatbot: Chatbot;
}

const nodeTypes = {
  custom: memo(CustomNode),
};

const ActionsView: React.FC<ActionsViewProps> = ({ chatbot }) => {
  const chatbotNode = {
    id: chatbot.name,
    type: "custom",
    data: { name: chatbot.name, job: "Chatbot", emoji: "🤖" },
    position: { x: (chatbot.states.length * 300) / 2, y: 50 },
  };

  const nodesFromStates = chatbot.states.reduce<any[]>(
    (acc, state, index) => {
      const stateNode = {
        id: state.name,
        type: "custom",
        data: { name: state.name, job: "State", emoji: "🔄" },
        position: { x: index * 300, y: 250 },
      };

      const processorNodes = state.processors.map(
        (processor, processorIndex) => ({
          id: `${state.name}-${processor.processor_name}`,
          type: "custom",
          data: {
            name: processor.processor_name,
            job: "Processor",
            emoji: "⚙️",
          },
          position: { x: index * 300, y: 400 + processorIndex * 150 },
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

    const processorEdges = state.processors.map((processor) => ({
      id: `${state.name}-${processor.processor_name}`,
      source: state.name,
      target: `${state.name}-${processor.processor_name}`,
    }));

    return [stateToChatbotEdge, ...processorEdges];
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesFromStates);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      className="bg-teal-50"
    ></ReactFlow>
  );
};

export { ActionsView };
