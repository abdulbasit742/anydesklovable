import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit2, Trash2, Eye, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/kb-editor")({
  head: () => ({ meta: [{ title: "Knowledge Base Editor — RemoteDesk" }] }),
  component: KBEditor,
});

function KBEditor() {
  const [articles, setArticles] = useState([
    { id: "1", title: "How to reset your password", category: "Account", language: "en", status: "published", views: 1240 },
    { id: "2", title: "Troubleshooting connection issues", category: "Troubleshooting", language: "en", status: "published", views: 856 },
    { id: "3", title: "Setting up two-factor authentication", category: "Security", language: "en", status: "draft", views: 0 },
  ]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const categories = ["Account", "Troubleshooting", "Security", "Billing", "Features"];

  const filteredArticles = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell title="Knowledge Base Editor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Knowledge Base</h2>
            <p className="text-sm text-muted-foreground">Create and manage self-service articles</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Article</DialogTitle>
              </DialogHeader>
              <CreateArticleForm onClose={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Views</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
                      <p>No articles found</p>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{article.title}</td>
                      <td className="px-4 py-3">{article.category}</td>
                      <td className="px-4 py-3">
                        <Badge variant={article.status === "published" ? "default" : "secondary"}>
                          {article.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{article.views.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(article.id)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function CreateArticleForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Account");

  const handleSubmit = () => {
    // Handle article creation
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          placeholder="Article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Account">Account</SelectItem>
            <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Billing">Billing</SelectItem>
            <SelectItem value="Features">Features</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          placeholder="Article content (supports markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Article</Button>
      </DialogFooter>
    </div>
  );
}
