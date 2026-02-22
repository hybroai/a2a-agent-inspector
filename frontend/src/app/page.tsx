"use client"

import { useState } from "react";
import LoadCard from "@/components/LoadCard";
import Editor from "@/components/Editor";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { loadAgent } from "@/lib/api/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, FileText, MessageSquare, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type TabType = 'editor' | 'chat';

interface AgentInfo {
  name?: string;
  version?: string;
  description?: string;
}

export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState<Record<string, unknown> | null>(null);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleLoadAgent = async () => {
    if (!url) return;
    
    setLoading(true);
    
    try {
      const response = await loadAgent(url);
      if (response.data) {
        setAgentData(response.data);
        setAgentInfo({
          name: response.data.name as string,
          version: response.data.version as string,
          description: response.data.description as string,
        });
        toast.success("Agent loaded successfully", {
          description: response.data.name ? `Connected to ${response.data.name}` : undefined
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load agent", {
        description: "Please check the URL and try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgentDataChange = (newData: Record<string, unknown>) => {
    setAgentData(newData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">A2A Agent Inspector</span>
            {agentInfo && (
              <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {agentInfo.name} <span className="text-xs opacity-70">v{agentInfo.version}</span>
                </span>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Section */}
        <section>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
            Inspect & Test A2A Agents
          </h1>
          <p className="text-muted-foreground">
            Load an agent by URL to inspect its card data and test chat interactions.
          </p>
        </section>

        {/* Load Agent Card */}
        <LoadCard
          url={url}
          loading={loading}
          onUrlChange={handleUrlChange}
          onLoadAgent={handleLoadAgent}
          isLoaded={!!agentData}
          agentName={agentInfo?.name}
        />

        {/* Content Section - Only show after agent is loaded */}
        {agentData ? (
          <>
            {/* Tab Navigation - Segmented Control Style */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === 'editor' 
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-primary/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Agent Card
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-primary/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Chat
              </Button>
            </div>

            {/* Content Area */}
            <div className="rounded-lg border border-border bg-card p-6">
              {activeTab === 'editor' && (
                <Editor
                  data={agentData}
                  title="Agent Card Data"
                  description="View and edit the agent's card configuration"
                  onDataChange={handleAgentDataChange}
                  readOnly={false}
                  maxHeight="450px"
                />
              )}

              {activeTab === 'chat' && (
                <ChatInterface
                  agentUrl={url}
                  title="Test Chat"
                  agentName={agentInfo?.name}
                />
              )}
            </div>
          </>
        ) : (
          /* Empty State - Show when no agent is loaded */
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Agent Loaded</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Enter an agent URL above to inspect its card data and test chat interactions. 
              The agent must be A2A-compliant and publicly accessible.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <a 
                href="https://a2a-protocol.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                A2A Protocol Docs
              </a>
              <span className="text-border">•</span>
              <a 
                href="https://github.com/hybroai/a2a-adapter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                A2A Adapter
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
