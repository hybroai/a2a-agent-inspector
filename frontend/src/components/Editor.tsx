"use client"

import { useState, useEffect } from "react";
import { Copy, Check, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditorProps {
  data?: Record<string, unknown>;
  title?: string;
  description?: string;
  onDataChange?: (data: Record<string, unknown>) => void;
  readOnly?: boolean;
  maxHeight?: string;
}

function Editor({ 
  data, 
  title = "JSON Data", 
  description = "View and edit JSON data",
  onDataChange,
  readOnly = false,
  maxHeight = "400px"
}: EditorProps) {
  const [jsonText, setJsonText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const formatJson = (obj: Record<string, unknown>) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  useEffect(() => {
    if (data) {
      const formatted = formatJson(data);
      setJsonText(formatted);
      setIsValid(true);
      setError("");
    }
  }, [data]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);

    try {
      const parsed = JSON.parse(newText);
      setIsValid(true);
      setError("");
      
      if (onDataChange && !readOnly) {
        onDataChange(parsed);
      }
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      toast.success("JSON copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatCurrentJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = formatJson(parsed);
      setJsonText(formatted);
      toast.success("JSON formatted successfully");
    } catch {
      toast.error("Cannot format invalid JSON");
    }
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={formatCurrentJson}
                disabled={!isValid}
                title="Format JSON"
              >
                <Code className="h-4 w-4 mr-1" />
                Format
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!jsonText}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 px-0 pb-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isValid ? 'bg-green-500' : 'bg-destructive'
                }`}
              />
              <span className={isValid ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
              {readOnly && (
                <span className="text-muted-foreground text-xs">(Read Only)</span>
              )}
            </div>
            
            <div className="text-muted-foreground">
              {jsonText.split('\n').length} lines
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={jsonText}
              onChange={handleTextChange}
              readOnly={readOnly}
              className={`font-mono text-sm resize-none ${
                !isValid ? 'border-destructive focus-visible:ring-destructive' : ''
              } ${readOnly ? 'bg-muted/50 cursor-default' : ''}`}
              style={{ 
                minHeight: maxHeight,
                maxHeight: maxHeight,
                overflowY: 'auto'
              }}    
              placeholder={data ? "" : "No data available..."}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                <strong>JSON Error:</strong> {error}
              </p>
            </div>
          )}

          {isValid && jsonText && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Size: {new Blob([jsonText]).size} bytes</span>
              <span>Characters: {jsonText.length}</span>
              {(() => {
                try {
                  const parsed = JSON.parse(jsonText);
                  if (Array.isArray(parsed)) {
                    return <span>Array items: {parsed.length}</span>;
                  } else if (typeof parsed === 'object' && parsed !== null) {
                    return <span>Object keys: {Object.keys(parsed).length}</span>;
                  }
                } catch { /* ignore */ }
                return null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Editor;
