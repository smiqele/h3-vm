import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/manrope";
import "../src/tokens.generated.css";
import "../src/preview.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Тема UI package",
      defaultValue: "dark",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div className="storybook-preview" data-preview-theme={context.globals.theme}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: { expanded: true },
    layout: "centered",
    options: { storySort: { order: ["Overview", "Primitives", "Components", "Patterns"] } },
    a11y: { test: "todo" },
  },
  tags: ["autodocs"],
};

export default preview;
