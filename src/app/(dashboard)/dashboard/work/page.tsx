"use client";

import {
  type Project,
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/projects";
import { useAuthStore } from "@/store/auth";
import {
  Button,
  Column,
  Heading,
  IconButton,
  Input,
  Row,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useEffect, useState } from "react";

export default function WorkDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken || !confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id, accessToken);
      setProjects(projects.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !editingProject) return;

    try {
      if (isCreating) {
        await createProject(editingProject, accessToken);
      } else if (editingProject.id) {
        await updateProject(editingProject.id, editingProject, accessToken);
      }
      setIsCreating(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  if (loading) return <Text>Loading projects...</Text>;

  return (
    <Column gap="24" fillWidth>
      <Row horizontal="between" vertical="center" fillWidth>
        <Heading variant="display-strong-m">Work Management</Heading>
        {!editingProject && (
          <Button
            onClick={() => {
              setIsCreating(true);
              setEditingProject({
                title: "",
                slug: "",
                content: "",
                summary: "",
                project_name: "",
                images: [],
                team: [],
                link: "",
                repository: "",
                published_at: new Date().toISOString().split("T")[0],
                seo_metadata: {
                  title: "",
                  description: "",
                  keywords: "",
                  og_image: "",
                },
              });
            }}
            variant="secondary"
          >
            Create New Project
          </Button>
        )}
      </Row>

      {editingProject ? (
        <Column
          as="form"
          onSubmit={handleSave}
          gap="24"
          background="surface"
          padding="l"
          radius="m"
          border="neutral-strong"
        >
          <Heading variant="heading-strong-m">
            {isCreating ? "Create Project" : `Edit: ${editingProject.title}`}
          </Heading>

          <Row gap="m">
            <Input
              id="title"
              label="Title"
              width="fill"
              value={editingProject.title || ""}
              onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
              required
            />
            <Input
              id="slug"
              label="Slug"
              width="fill"
              value={editingProject.slug || ""}
              onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
              required
            />
          </Row>

          <Row gap="m">
            <Input
              id="project_name"
              label="Project Name"
              width="fill"
              value={editingProject.project_name || ""}
              onChange={(e) =>
                setEditingProject({ ...editingProject, project_name: e.target.value })
              }
            />
            <Input
              id="published_at"
              label="Published At"
              type="date"
              width="fill"
              value={editingProject.published_at?.split("T")[0] || ""}
              onChange={(e) =>
                setEditingProject({ ...editingProject, published_at: e.target.value })
              }
            />
          </Row>

          <Textarea
            id="summary"
            label="Summary"
            value={editingProject.summary || ""}
            onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
          />

          <Textarea
            id="content"
            label="Content (Markdown)"
            value={editingProject.content || ""}
            onChange={(e) => setEditingProject({ ...editingProject, content: e.target.value })}
            required
            style={{ minHeight: "300px" }}
          />

          <Row gap="m">
            <Input
              id="link"
              label="Live Link"
              width="fill"
              value={editingProject.link || ""}
              onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
            />
            <Input
              id="repository"
              label="Repository"
              width="fill"
              value={editingProject.repository || ""}
              onChange={(e) => setEditingProject({ ...editingProject, repository: e.target.value })}
            />
          </Row>

          <Column gap="s">
            <Heading variant="heading-strong-xs">SEO Metadata</Heading>
            <Input
              id="meta_title"
              label="Meta Title"
              width="fill"
              value={editingProject.seo_metadata?.title || ""}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  seo_metadata: {
                    title: e.target.value,
                    description: editingProject.seo_metadata?.description || "",
                    keywords: editingProject.seo_metadata?.keywords || "",
                    og_image: editingProject.seo_metadata?.og_image || "",
                  },
                })
              }
            />
            <Textarea
              id="meta_description"
              label="Meta Description"
              value={editingProject.seo_metadata?.description || ""}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  seo_metadata: {
                    title: editingProject.seo_metadata?.title || "",
                    description: e.target.value,
                    keywords: editingProject.seo_metadata?.keywords || "",
                    og_image: editingProject.seo_metadata?.og_image || "",
                  },
                })
              }
            />
            <Input
              id="meta_keywords"
              label="Meta Keywords"
              width="fill"
              value={editingProject.seo_metadata?.keywords || ""}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  seo_metadata: {
                    title: editingProject.seo_metadata?.title || "",
                    description: editingProject.seo_metadata?.description || "",
                    keywords: e.target.value,
                    og_image: editingProject.seo_metadata?.og_image || "",
                  },
                })
              }
            />
          </Column>

          <Row gap="m">
            <Button
              variant="secondary"
              onClick={() => {
                setEditingProject(null);
                setIsCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              {isCreating ? "Create Project" : "Update Project"}
            </Button>
          </Row>
        </Column>
      ) : (
        <Column gap="m">
          {projects.map((project) => (
            <Row
              key={project.id}
              horizontal="between"
              vertical="center"
              background="surface"
              padding="m"
              radius="m"
              border="neutral-strong"
            >
              <Column gap="xs">
                <Text variant="heading-strong-xs">{project.title}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  /{project.slug} • {project.published_at.split("T")[0]}
                </Text>
              </Column>
              <Row gap="s">
                <IconButton
                  icon="edit"
                  variant="secondary"
                  tooltip="Edit Project"
                  onClick={() => {
                    setEditingProject(project);
                    setIsCreating(false);
                  }}
                />
                <IconButton
                  icon="trash"
                  variant="danger"
                  tooltip="Delete Project"
                  onClick={() => handleDelete(project.id)}
                />
              </Row>
            </Row>
          ))}
          {projects.length === 0 && (
            <Text align="center" onBackground="neutral-weak">
              No projects found. Create one to get started!
            </Text>
          )}
        </Column>
      )}
    </Column>
  );
}
