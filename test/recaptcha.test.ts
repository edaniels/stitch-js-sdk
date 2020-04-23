import * as sinon from "ts-sinon";
import { RealmAdminClient } from "../src/Client";

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

describe("Recaptcha", () => {
  const test: { [key: string]: any } = {};
  const token = "my-little-token";

  beforeAll(async () => {
    test.prevFetch = window.fetch;
    test.fetch = sinon.stubObject(window, ["fetch"]).fetch;
    global.fetch = test.fetch;
    window.fetch = test.fetch;
    test.fetch.returns(
      Promise.resolve({ status: 204, headers: { get: () => "" } })
    );
    let adminClient = new RealmAdminClient();
    await adminClient.verifyRecaptcha(token);
  });

  afterAll(() => {
    window.fetch = test.prevFetch;
    global.fetch = test.prevFetch;
  });

  it("should be verified with cors enabled", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].mode).toEqual("cors");
  });

  it("should allow cookies to be sent with the request", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(test.fetch.getCalls()[0].args[1].credentials).toEqual("include");
  });

  it("should use URLSearchParams to submit token", () => {
    expect(test.fetch.getCalls()[0].args[0]).toContain(
      `verify?response=${token}`
    );
  });

  it("should let the request determine the Content Type", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(
      test.fetch.getCalls()[0].args[1].headers["Content-Type"]
    ).toBeUndefined();
  });

  it("should not require Stitch specific header", () => {
    expect(test.fetch.getCalls().length).toEqual(1);
    expect(
      test.fetch.getCalls()[0].args[1].headers["X-STITCH-Request-Origin"]
    ).toBeUndefined();
  });
});
