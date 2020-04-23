import { mocks } from "mock-browser";
import { createStorage } from "../src/auth/storage";

const MockBrowser = mocks.MockBrowser;

const storageTypes = ["localStorage", "fallback"];

declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}

// The type of the item in storage differs between the MockBrowser and Evergreen
function storageValue(value, storageType, isMocked) {
  if (!isMocked && storageType === "localStorage") {
    return `${value}`;
  }
  return value;
}

describe("storage", function() {
  const namespace = "foofoo";
  let isMocked = false;

  beforeAll(() => {
    if (!global.window?.localStorage) {
      isMocked = true;
      const mb = new MockBrowser();
      Object.defineProperty(global.window, "localStorage", {
        value: mb.getLocalStorage(),
        configurable: true
      });
    }
  });

  for (const storageType of storageTypes) {
    it(`should save token to ${storageType}`, () => {
      const storage = createStorage({ storageType, namespace });
      storage.set("token", "foo");
      expect(storage.get("token")).toEqual("foo");
    });

    it(`should remove token to ${storageType}`, () => {
      const storage = createStorage({ storageType, namespace });
      storage.remove("token");
      expect(storage.get("token")).toBeNull();
    });

    it(`should return key by index for ${storageType}`, () => {
      const storage = createStorage({ storageType, namespace });
      storage.set("foo", 42);
      storage.set("bar", 84);

      expect(storage.store.getItem(storage.store.key(1)!)).toEqual(
        storageValue(84, storageType, isMocked)
      );
      expect(storage.store.getItem(storage.store.key(0)!)).toEqual(
        storageValue(42, storageType, isMocked)
      );
    });
  }
});
