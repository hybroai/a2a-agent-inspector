"use client"

import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LoadCardProps {
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onLoadAgent: () => void;
}

function LoadCard({ url, loading, onUrlChange, onLoadAgent }: LoadCardProps) {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="p-5 w-full">
      <Card>
        <CardHeader>
          <CardTitle>HYBRO AI A2A Inspector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-url">Agent URL</Label>
            <Input
              id="agent-url"
              type="url"
              placeholder="https://<your-agent-url>:<port-number>"
              value={url}
              onChange={handleUrlChange}
            />
          </div>
          
          <Button 
            disabled={loading || !url}
            className="w-full"
            onClick={onLoadAgent}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Agent...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Load Agent
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoadCard;