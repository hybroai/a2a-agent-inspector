"use client"

import { useState, useEffect } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditorProps {
  data?: any;
  title?: string;
  description?: string;
  onDataChange?: (data: any) => void;
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

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatCurrentJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = formatJson(parsed);
      setJsonText(formatted);
      toast.success("JSON formatted successfully");
    } catch (err) {
      toast.error("Cannot format invalid JSON");
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
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
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isValid ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className={isValid ? 'text-green-700' : 'text-red-700'}>
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
              {readOnly && (
                <span className="text-gray-500 text-xs">(Read Only)</span>
              )}
            </div>
            
            <div className="text-gray-500">
              {jsonText.split('\n').length} lines
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={jsonText}
              onChange={handleTextChange}
              readOnly={readOnly}
              className={`font-mono text-sm resize-none ${
                !isValid ? 'border-red-500 focus-visible:ring-red-500' : ''
              } ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}
              style={{ 
                minHeight: maxHeight,
                maxHeight: maxHeight,
                overflowY: 'auto'
              }}    
              placeholder={data ? "" : "No data available..."}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>JSON Error:</strong> {error}
              </p>
            </div>
          )}

          {isValid && jsonText && (
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t">
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
                } catch {}
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