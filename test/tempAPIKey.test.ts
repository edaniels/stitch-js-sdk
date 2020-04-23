import * as sinon from "ts-sinon";
import { RealmAdminClient } from "../src/Client";
import { CreateTempAPIKeyRequest } from "../src/api/v1/TempAPIKeys";

declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
      fetch: any;
    }
  }
}

describe("Clusters", () => {
  const test: { [key: string]: any } = {};
  const desc = "I love my temp Keys!";

  beforeAll(async () => {
    test.prevFetch = window.fetch;
    test.fetch = sinon.stubObject(window, ["fetch"]).fetch;
    global.fetch = test.fetch;
    window.fetch = test.fetch;
    test.fetch.returns(
      Promise.resolve({
        status: 204,
        headers: { get: () => "" },
        text: () => Promise.resolve(`{"desc": "${desc}", "key": "sosecret"}`)
      })
    );
    let adminClient = new RealmAdminClient();
    adminClient.isAuthenticated = () => true;

    await adminClient
      .privateTempAPIKeys()
      .create(new CreateTempAPIKeyRequest({ desc }));
  });

  afterAll(() => {
    window.fetch = test.prevFetch;
    global.fetch = test.prevFetch;
  });

  it("should always include a desc in the request body", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].body).toContain(desc);
  });

  it("should have json as Content Type", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].headers["Content-Type"]).toBe(
      "application/json"
    );
  });

  it("should require Authorization", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].headers["Authorization"]).toContain(
      "Bearer"
    );
  });
});
