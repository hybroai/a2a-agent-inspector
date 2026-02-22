"use client"

import { useState } from "react";
import { CloudDownload, Loader2, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LoadCardProps {
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onLoadAgent: () => void;
  isLoaded?: boolean;
  agentName?: string;
}

function LoadCard({ url, loading, onUrlChange, onLoadAgent, isLoaded, agentName }: LoadCardProps) {
  const [urlError, setUrlError] = useState("");

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl) return true;
    try {
      const urlObj = new URL(inputUrl);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    onUrlChange(newUrl);
    
    if (newUrl && !validateUrl(newUrl)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com:8080)");
    } else {
      setUrlError("");
    }
  };

  const isValidUrl = url && validateUrl(url) && !urlError;

  return (
    <Card className={isLoaded ? "border-green-500/30 bg-green-500/5" : ""}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isLoaded ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Agent Loaded
                </>
              ) : (
                "Load Agent"
              )}
            </CardTitle>
            <CardDescription>
              {isLoaded && agentName 
                ? `Connected to ${agentName}` 
                : "Enter the URL of an A2A-compliant agent"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent-url">Agent URL</Label>
          <div className="relative">
            <Input
              id="agent-url"
              type="url"
              placeholder="https://your-agent.example.com:8080"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidUrl && !loading) {
                  onLoadAgent();
                }
              }}
              className={`pr-10 ${urlError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {url && !urlError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            )}
            {urlError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
          {urlError && (
            <p className="text-sm text-destructive">{urlError}</p>
          )}
        </div>
        
        <Button 
          disabled={loading || !isValidUrl}
          className="w-full sm:w-auto"
          variant={isLoaded ? "success" : "default"}
          onClick={onLoadAgent}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading Agent...
            </>
          ) : isLoaded ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Agent
            </>
          ) : (
            <>
              <CloudDownload className="h-4 w-4 mr-2" />
              Load Agent
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default LoadCard;
