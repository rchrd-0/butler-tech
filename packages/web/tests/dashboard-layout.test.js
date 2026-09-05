import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  loadDashboardLayout,
  saveDashboardLayout,
} from "../src/lib/dashboard-layout.js";

function createStorage(value = null) {
  return {
    value,
    getItem() {
      return this.value;
    },
    setItem(_key, nextValue) {
      this.value = nextValue;
    },
  };
}

test("loads saved dashboard layouts and rejects invalid values", () => {
  const savedOrder = ["location", "status", "stale", "priority"];
  const validStorage = createStorage(
    JSON.stringify({
      version: 1,
      widgetOrder: savedOrder,
      hiddenWidgetIds: ["status", "priority"],
    }),
  );
  const previousStorage = createStorage(JSON.stringify({ version: 1, widgetOrder: savedOrder }));
  const invalidStorage = createStorage(
    JSON.stringify({ version: 1, widgetOrder: ["status", "stale", "priority"] }),
  );
  const invalidVisibilityStorage = createStorage(
    JSON.stringify({ version: 1, widgetOrder: savedOrder, hiddenWidgetIds: ["unknown"] }),
  );

  assert.deepEqual(loadDashboardLayout(validStorage), {
    widgetOrder: savedOrder,
    hiddenWidgetIds: ["status", "priority"],
  });
  assert.deepEqual(loadDashboardLayout(previousStorage), {
    widgetOrder: savedOrder,
    hiddenWidgetIds: [],
  });
  assert.deepEqual(loadDashboardLayout(invalidStorage), DEFAULT_DASHBOARD_LAYOUT);
  assert.deepEqual(loadDashboardLayout(invalidVisibilityStorage), DEFAULT_DASHBOARD_LAYOUT);
});

test("saves widget order and visibility in one versioned dashboard layout", () => {
  const storage = createStorage();
  const layout = {
    widgetOrder: ["priority", "location", "status", "stale"],
    hiddenWidgetIds: ["status"],
  };

  saveDashboardLayout(layout, storage);

  assert.deepEqual(JSON.parse(storage.value), { version: 1, ...layout });
});
