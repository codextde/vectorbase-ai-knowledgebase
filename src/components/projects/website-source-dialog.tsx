"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe,
  Loader2,
  Link as LinkIcon,
  FileText,
  X,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WebsiteSourceDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

interface FetchedLink {
  url: string;
  selected: boolean;
}

export function WebsiteSourceDialog({
  projectId,
  trigger,
}: WebsiteSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(false);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "crawl" | "sitemap" | "individual"
  >("crawl");

  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(10);
  const [crawlIncludePaths, setCrawlIncludePaths] = useState<string[]>([]);
  const [crawlExcludePaths, setCrawlExcludePaths] = useState<string[]>([]);
  const [crawlIncludeInput, setCrawlIncludeInput] = useState("");
  const [crawlExcludeInput, setCrawlExcludeInput] = useState("");
  const [slowScraping, setSlowScraping] = useState(false);

  const [sitemapUrl, setSitemapUrl] = useState("");
  const [sitemapIncludePaths, setSitemapIncludePaths] = useState<string[]>([]);
  const [sitemapExcludePaths, setSitemapExcludePaths] = useState<string[]>([]);
  const [sitemapIncludeInput, setSitemapIncludeInput] = useState("");
  const [sitemapExcludeInput, setSitemapExcludeInput] = useState("");
  const [fetchedLinks, setFetchedLinks] = useState<FetchedLink[]>([]);
  const [showLinks, setShowLinks] = useState(false);

  const [individualUrl, setIndividualUrl] = useState("");

  const addPath = (
    paths: string[],
    setPaths: (paths: string[]) => void,
    input: string,
    setInput: (input: string) => void,
  ) => {
    const trimmed = input.trim();
    if (trimmed && !paths.includes(trimmed)) {
      setPaths([...paths, trimmed]);
      setInput("");
    }
  };

  const removePath = (
    paths: string[],
    setPaths: (paths: string[]) => void,
    path: string,
  ) => {
    setPaths(paths.filter((p) => p !== path));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    paths: string[],
    setPaths: (paths: string[]) => void,
    input: string,
    setInput: (input: string) => void,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addPath(paths, setPaths, input, setInput);
    }
  };

  const handleFetchSitemapLinks = async () => {
    if (!sitemapUrl) {
      toast.error("Please enter a sitemap URL");
      return;
    }

    try {
      new URL(sitemapUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setFetchingLinks(true);
    try {
      const response = await fetch("/api/sitemap/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitemapUrl,
          includePaths: sitemapIncludePaths,
          excludePaths: sitemapExcludePaths,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch sitemap");
      }

      const data = await response.json();
      setFetchedLinks(
        data.urls.map((url: string) => ({ url, selected: true })),
      );
      setShowLinks(true);
      toast.success(`Found ${data.urls.length} links`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch sitemap",
      );
    } finally {
      setFetchingLinks(false);
    }
  };

  const toggleLinkSelection = (url: string) => {
    setFetchedLinks((links) =>
      links.map((link) =>
        link.url === url ? { ...link, selected: !link.selected } : link,
      ),
    );
  };

  const selectAllLinks = (selected: boolean) => {
    setFetchedLinks((links) => links.map((link) => ({ ...link, selected })));
  };

  const handleAddCrawlSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      new URL(crawlUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sources/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: "website",
          name: new URL(crawlUrl).hostname,
          url: crawlUrl,
          crawlType: "crawl",
          includePaths: crawlIncludePaths,
          excludePaths: crawlExcludePaths,
          slowScraping,
          maxDepth: crawlDepth,
          maxPages,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create source");
      }

      toast.success("Website crawl started!");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create source",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSitemapSource = async () => {
    const selectedLinks = fetchedLinks.filter((link) => link.selected);
    if (selectedLinks.length === 0) {
      toast.error("Please select at least one link");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sources/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: "website",
          name: new URL(sitemapUrl).hostname,
          url: sitemapUrl,
          crawlType: "sitemap",
          includePaths: sitemapIncludePaths,
          excludePaths: sitemapExcludePaths,
          links: selectedLinks.map((l) => l.url),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create source");
      }

      toast.success(
        `Sitemap source created with ${selectedLinks.length} links!`,
      );
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create source",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndividualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualUrl) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      new URL(individualUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sources/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: "website",
          name: new URL(individualUrl).hostname,
          url: individualUrl,
          crawlType: "single",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create source");
      }

      toast.success("Link added!");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create source",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCrawlUrl("");
    setCrawlDepth(2);
    setMaxPages(10);
    setCrawlIncludePaths([]);
    setCrawlExcludePaths([]);
    setCrawlIncludeInput("");
    setCrawlExcludeInput("");
    setSlowScraping(false);
    setSitemapUrl("");
    setSitemapIncludePaths([]);
    setSitemapExcludePaths([]);
    setSitemapIncludeInput("");
    setSitemapExcludeInput("");
    setFetchedLinks([]);
    setShowLinks(false);
    setIndividualUrl("");
    setActiveTab("crawl");
  };

  const selectedCount = fetchedLinks.filter((l) => l.selected).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            Add Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Website</DialogTitle>
          <DialogDescription>
            Crawl web pages or submit sitemaps to update your AI with the latest
            content.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "crawl" | "sitemap" | "individual")
          }
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crawl">Crawl links</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="individual">Individual link</TabsTrigger>
          </TabsList>

          <TabsContent
            value="crawl"
            className="flex-1 overflow-auto space-y-4 pt-4"
          >
            <form onSubmit={handleAddCrawlSource} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crawl-url">Website URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    https://
                  </span>
                  <Input
                    id="crawl-url"
                    placeholder="www.example.com"
                    value={crawlUrl.replace(/^https?:\/\//, "")}
                    onChange={(e) =>
                      setCrawlUrl(
                        `https://${e.target.value.replace(/^https?:\/\//, "")}`,
                      )
                    }
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Links found during crawling may be updated if new links are
                  discovered or some links are invalid.
                </p>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Advanced options
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="include-paths">Include only paths</Label>
                      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9">
                        {crawlIncludePaths.map((path) => (
                          <Badge
                            key={path}
                            variant="secondary"
                            className="gap-1"
                          >
                            {path}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removePath(
                                  crawlIncludePaths,
                                  setCrawlIncludePaths,
                                  path,
                                )
                              }
                            />
                          </Badge>
                        ))}
                        <input
                          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                          placeholder="Ex: blog/* , dev/*"
                          value={crawlIncludeInput}
                          onChange={(e) => setCrawlIncludeInput(e.target.value)}
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              crawlIncludePaths,
                              setCrawlIncludePaths,
                              crawlIncludeInput,
                              setCrawlIncludeInput,
                            )
                          }
                          onBlur={() =>
                            addPath(
                              crawlIncludePaths,
                              setCrawlIncludePaths,
                              crawlIncludeInput,
                              setCrawlIncludeInput,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exclude-paths">Exclude paths</Label>
                      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9">
                        {crawlExcludePaths.map((path) => (
                          <Badge
                            key={path}
                            variant="secondary"
                            className="gap-1"
                          >
                            {path}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removePath(
                                  crawlExcludePaths,
                                  setCrawlExcludePaths,
                                  path,
                                )
                              }
                            />
                          </Badge>
                        ))}
                        <input
                          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                          placeholder="Ex: blog/* , dev/*"
                          value={crawlExcludeInput}
                          onChange={(e) => setCrawlExcludeInput(e.target.value)}
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              crawlExcludePaths,
                              setCrawlExcludePaths,
                              crawlExcludeInput,
                              setCrawlExcludeInput,
                            )
                          }
                          onBlur={() =>
                            addPath(
                              crawlExcludePaths,
                              setCrawlExcludePaths,
                              crawlExcludeInput,
                              setCrawlExcludeInput,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crawl-depth">Crawl Depth</Label>
                      <Input
                        id="crawl-depth"
                        type="number"
                        min={0}
                        max={5}
                        value={crawlDepth}
                        onChange={(e) =>
                          setCrawlDepth(parseInt(e.target.value) || 0)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        0 = single page, higher = follow links
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-pages">Max Pages</Label>
                      <Input
                        id="max-pages"
                        type="number"
                        min={1}
                        max={100}
                        value={maxPages}
                        onChange={(e) =>
                          setMaxPages(parseInt(e.target.value) || 1)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum pages to crawl
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slow-scraping"
                      checked={slowScraping}
                      onCheckedChange={setSlowScraping}
                    />
                    <Label
                      htmlFor="slow-scraping"
                      className="flex items-center gap-1"
                    >
                      Slow scraping
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Add delays between requests to avoid rate limiting
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                </div>
              </details>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch links
              </Button>
            </form>
          </TabsContent>

          <TabsContent
            value="sitemap"
            className="flex-1 overflow-hidden flex flex-col space-y-4 pt-4"
          >
            {!showLinks ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sitemap-url">Sitemap URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                      https://
                    </span>
                    <Input
                      id="sitemap-url"
                      placeholder="www.example.com/sitemap.xml"
                      value={sitemapUrl.replace(/^https?:\/\//, "")}
                      onChange={(e) =>
                        setSitemapUrl(
                          `https://${e.target.value.replace(/^https?:\/\//, "")}`,
                        )
                      }
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Links found during crawling or sitemap retrieval may be
                    updated if new links are discovered or some links are
                    invalid.
                  </p>
                </div>

                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Advanced options
                  </summary>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Include only paths</Label>
                      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9">
                        {sitemapIncludePaths.map((path) => (
                          <Badge
                            key={path}
                            variant="secondary"
                            className="gap-1"
                          >
                            {path}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removePath(
                                  sitemapIncludePaths,
                                  setSitemapIncludePaths,
                                  path,
                                )
                              }
                            />
                          </Badge>
                        ))}
                        <input
                          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                          placeholder="Ex: blog/* , dev/*"
                          value={sitemapIncludeInput}
                          onChange={(e) =>
                            setSitemapIncludeInput(e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              sitemapIncludePaths,
                              setSitemapIncludePaths,
                              sitemapIncludeInput,
                              setSitemapIncludeInput,
                            )
                          }
                          onBlur={() =>
                            addPath(
                              sitemapIncludePaths,
                              setSitemapIncludePaths,
                              sitemapIncludeInput,
                              setSitemapIncludeInput,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Exclude paths</Label>
                      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-9">
                        {sitemapExcludePaths.map((path) => (
                          <Badge
                            key={path}
                            variant="secondary"
                            className="gap-1"
                          >
                            {path}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                removePath(
                                  sitemapExcludePaths,
                                  setSitemapExcludePaths,
                                  path,
                                )
                              }
                            />
                          </Badge>
                        ))}
                        <input
                          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                          placeholder="Ex: blog/* , dev/*"
                          value={sitemapExcludeInput}
                          onChange={(e) =>
                            setSitemapExcludeInput(e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              sitemapExcludePaths,
                              setSitemapExcludePaths,
                              sitemapExcludeInput,
                              setSitemapExcludeInput,
                            )
                          }
                          onBlur={() =>
                            addPath(
                              sitemapExcludePaths,
                              setSitemapExcludePaths,
                              sitemapExcludeInput,
                              setSitemapExcludeInput,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </details>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleFetchSitemapLinks}
                  disabled={fetchingLinks}
                >
                  {fetchingLinks && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Load sitemap
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLinks(false)}
                    >
                      Back
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} of {fetchedLinks.length} links selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllLinks(true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllLinks(false)}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 border rounded-md">
                  <div className="p-2 space-y-1">
                    {fetchedLinks.map((link) => (
                      <div
                        key={link.url}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                          link.selected ? "bg-muted/50" : ""
                        }`}
                        onClick={() => toggleLinkSelection(link.url)}
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            link.selected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {link.selected && <Check className="h-3 w-3" />}
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate flex-1">
                          {link.url}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={handleAddSitemapSource}
                  disabled={loading || selectedCount === 0}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add {selectedCount} link{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="individual" className="space-y-4 pt-4">
            <form onSubmit={handleAddIndividualLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="individual-url">URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    https://
                  </span>
                  <Input
                    id="individual-url"
                    placeholder="www.example.com"
                    value={individualUrl.replace(/^https?:\/\//, "")}
                    onChange={(e) =>
                      setIndividualUrl(
                        `https://${e.target.value.replace(/^https?:\/\//, "")}`,
                      )
                    }
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add link
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
