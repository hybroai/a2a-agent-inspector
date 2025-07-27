"use client"

import { useState } from "react";
import LoadCard from "@/components/LoadCard";
import Editor from "@/components/Editor";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { loadAgent } from "@/lib/api/api";

type TabType = 'editor' | 'chat';

export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleLoadAgent = async () => {
    if (!url) return;
    
    setLoading(true);
    
    try {
      const agentData = await loadAgent(url);
      setAgentData(agentData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentDataChange = (newData: any) => {
    setAgentData(newData.data);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <LoadCard
        url={url}
        loading={loading}
        onUrlChange={handleUrlChange}
        onLoadAgent={handleLoadAgent}
      />

      <div className="flex justify-center gap-4 p-5">
        <Button
          variant={activeTab === 'editor' ? 'default' : 'outline'}
          onClick={() => setActiveTab('editor')}
          className="px-6 py-2"
        >
          Inspect Agent Card
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          onClick={() => setActiveTab('chat')}
          className="px-6 py-2"
        >
          Inspect Chat
        </Button>
      </div>

      <div className="p-5 w-full">
        {activeTab === 'editor' && (
          <Editor
            data={agentData}
            title="Agent Card Data"
            description="Edit agent card data"
            onDataChange={handleAgentDataChange}
            readOnly={false}
            maxHeight="400px"
          />
        )}

        {activeTab === 'chat' && (
          <ChatInterface
            agentUrl={url}
            title="Agent Chat"
          />
        )}
      </div>
    </div>
  );
} 