import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor with create shows Creating label", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor with str_replace shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("str_replace_editor with insert shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("str_replace_editor with view shows Reading label", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Reading /App.jsx")).toBeDefined();
});

test("file_manager with rename shows Renaming label", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("file_manager with delete shows Deleting label", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Deleting /App.jsx")).toBeDefined();
});

test("unknown tool falls back to raw tool name", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      args={{}}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("in-progress state renders spinner and no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
      result={null}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("completed state renders green dot and no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
