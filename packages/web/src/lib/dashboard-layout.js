export const DEFAULT_WIDGET_ORDER = ["status", "stale", "priority", "location"];

const DASHBOARD_LAYOUT_KEY = "butler-dashboard-layout";
const DASHBOARD_LAYOUT_VERSION = 1;

function isWidgetOrder(value) {
  return (
    Array.isArray(value) &&
    value.length === DEFAULT_WIDGET_ORDER.length &&
    new Set(value).size === DEFAULT_WIDGET_ORDER.length &&
    value.every((widgetId) => DEFAULT_WIDGET_ORDER.includes(widgetId))
  );
}

export function loadWidgetOrder(storage) {
  try {
    const layoutStorage = storage ?? window.localStorage;
    const storedLayout = layoutStorage.getItem(DASHBOARD_LAYOUT_KEY);
    if (!storedLayout) return [...DEFAULT_WIDGET_ORDER];

    const layout = JSON.parse(storedLayout);

    if (layout.version === DASHBOARD_LAYOUT_VERSION && isWidgetOrder(layout.widgetOrder)) {
      return [...layout.widgetOrder];
    }
  } catch (error) {
    console.warn("Could not read the saved dashboard layout.", error);
  }

  return [...DEFAULT_WIDGET_ORDER];
}

export function saveWidgetOrder(widgetOrder, storage) {
  try {
    const layoutStorage = storage ?? window.localStorage;
    layoutStorage.setItem(
      DASHBOARD_LAYOUT_KEY,
      JSON.stringify({ version: DASHBOARD_LAYOUT_VERSION, widgetOrder }),
    );
  } catch (error) {
    console.warn("Could not save the dashboard layout.", error);
  }
}
