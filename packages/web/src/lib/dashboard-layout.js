export const DEFAULT_WIDGET_ORDER = ["status", "stale", "priority", "location"];
export const DEFAULT_DASHBOARD_LAYOUT = {
  widgetOrder: DEFAULT_WIDGET_ORDER,
  hiddenWidgetIds: [],
};

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

function isHiddenWidgetIds(value) {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every((widgetId) => DEFAULT_WIDGET_ORDER.includes(widgetId))
  );
}

function getDefaultDashboardLayout() {
  return {
    widgetOrder: [...DEFAULT_DASHBOARD_LAYOUT.widgetOrder],
    hiddenWidgetIds: [...DEFAULT_DASHBOARD_LAYOUT.hiddenWidgetIds],
  };
}

export function loadDashboardLayout(storage) {
  try {
    const layoutStorage = storage ?? window.localStorage;
    const storedLayout = layoutStorage.getItem(DASHBOARD_LAYOUT_KEY);
    if (!storedLayout) return getDefaultDashboardLayout();

    const layout = JSON.parse(storedLayout);
    const hiddenWidgetIds = layout.hiddenWidgetIds ?? [];

    if (
      layout.version === DASHBOARD_LAYOUT_VERSION &&
      isWidgetOrder(layout.widgetOrder) &&
      isHiddenWidgetIds(hiddenWidgetIds)
    ) {
      return {
        widgetOrder: [...layout.widgetOrder],
        hiddenWidgetIds: [...hiddenWidgetIds],
      };
    }
  } catch (error) {
    console.warn("Could not read the saved dashboard layout.", error);
  }

  return getDefaultDashboardLayout();
}

export function saveDashboardLayout(layout, storage) {
  try {
    const layoutStorage = storage ?? window.localStorage;
    layoutStorage.setItem(
      DASHBOARD_LAYOUT_KEY,
      JSON.stringify({ version: DASHBOARD_LAYOUT_VERSION, ...layout }),
    );
  } catch (error) {
    console.warn("Could not save the dashboard layout.", error);
  }
}
