"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Check,
  Terminal,
  Folder,
  FileCode,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function InteractiveDemo() {
  const [inputText, setInputText] = useState("Awesome Next.js 14 stack");
  const [selectedVariant, setSelectedVariant] = useState<
    "default" | "secondary" | "outline" | "destructive" | "gradient"
  >("gradient");
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const testApiRoute = async () => {
    setIsLoadingApi(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch {
      setApiResponse(JSON.stringify({ error: "Failed to connect to /api/health" }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="demo" className="py-16 container space-y-16">
      {/* Component Playground */}
      <div id="components" className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Badge variant="glow" className="px-3 py-1">
            Live Sandbox
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Interactive shadcn/ui Showcase
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
            Try out the pre-installed components and variant configurations in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Controls & Inputs */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Component Playground
              </CardTitle>
              <CardDescription>
                Customize props and see immediate updates on the right.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Input Component</label>
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type something here..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setInputText("Next.js 14 is blazing fast!")}
                  >
                    Preset
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Button Variant</label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["default", "gradient", "secondary", "outline", "destructive"] as const
                  ).map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={selectedVariant === v ? "default" : "outline"}
                      onClick={() => setSelectedVariant(v)}
                      className="capitalize text-xs"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Badge Variations</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="glow">Glow Pulse</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground">
                All components styled with Tailwind CSS
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`<Button variant="${selectedVariant}">${inputText}</Button>`)}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    Copied Code
                  </>
                ) : (
                  <>Copy Snippet</>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Live Preview Panel */}
          <Card className="border-border/80 bg-card/60 backdrop-blur shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  Live Preview
                </CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription>
                Rendered preview of the selected component configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-6">
              <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed bg-muted/30 gap-4">
                <Badge variant="glow">{inputText || "Sample Badge"}</Badge>
                <Button variant={selectedVariant} size="lg" className="min-w-[160px]">
                  <Send className="mr-2 h-4 w-4" />
                  {inputText || "Action Button"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Variant: <span className="font-mono font-semibold text-foreground">{selectedVariant}</span>
                </p>
              </div>

              {/* API Route Tester */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-indigo-500" />
                    Pages Router API Check (`/api/health`)
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={testApiRoute}
                    disabled={isLoadingApi}
                  >
                    {isLoadingApi ? "Testing..." : "Test Endpoint"}
                  </Button>
                </div>
                {apiResponse && (
                  <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto text-emerald-600 dark:text-emerald-400 border">
                    {apiResponse}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Structure Explorer */}
      <div id="structure" className="space-y-6 pt-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Badge variant="outline" className="px-3 py-1">
            Project Architecture
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Clean Folder Structure
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
            Structured for immediate scalability, maintainability, and clean code division.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-indigo-500 font-semibold">
                <Folder className="h-5 w-5" />
                <span>components/</span>
              </div>
              <CardDescription>Reusable UI & page components</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5 text-foreground">
                <Folder className="h-4 w-4 text-indigo-400" />
                <span>ui/</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> button.tsx</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> card.tsx</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> badge.tsx</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> input.tsx</div>
              </div>
              <div className="flex items-center gap-1.5 pt-1"><FileCode className="h-3.5 w-3.5" /> navbar.tsx</div>
              <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> hero-section.tsx</div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-purple-500 font-semibold">
                <Folder className="h-5 w-5" />
                <span>pages/ &amp; app/</span>
              </div>
              <CardDescription>Routing, pages &amp; API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5 text-foreground">
                <Folder className="h-4 w-4 text-purple-400" />
                <span>app/</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> layout.tsx</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> page.tsx</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> globals.css</div>
              </div>
              <div className="flex items-center gap-1.5 text-foreground pt-1">
                <Folder className="h-4 w-4 text-purple-400" />
                <span>pages/api/</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> health.ts</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <Folder className="h-5 w-5" />
                <span>utils/ &amp; config</span>
              </div>
              <CardDescription>Helper functions &amp; configurations</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5 text-foreground">
                <Folder className="h-4 w-4 text-emerald-400" />
                <span>utils/</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> cn.ts</div>
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> index.ts</div>
              </div>
              <div className="flex items-center gap-1.5 text-foreground pt-1">
                <Folder className="h-4 w-4 text-emerald-400" />
                <span>lib/</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> utils.ts</div>
              </div>
              <div className="flex items-center gap-1.5 pt-1"><FileCode className="h-3.5 w-3.5" /> components.json</div>
              <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> tailwind.config.ts</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
