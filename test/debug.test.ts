import RealmMongoFixture from "./fixtures/realm_mongo_fixture";

import {
  buildAdminTestHarness,
  extractTestFixtureDataPoints
} from "./testutil";

import { AppFunction } from "../src/api/v3/Functions";

const FUNC_NAME = "myFunction";
const FUNC_SOURCE =
  "exports = function(arg1, arg2){ return {sum: arg1 + arg2, userId: context.user.id}}";

async function createTestFunction(functions) {
  const func = await functions.create(
    new AppFunction({ name: FUNC_NAME, source: FUNC_SOURCE })
  );
  expect(func.name).toEqual(FUNC_NAME);

  const funcs = await functions.list();
  expect(funcs).toHaveLength(1);
  expect(funcs[0].name).toEqual(FUNC_NAME);
}

describe("Debugging functions", () => {
  const test = new RealmMongoFixture();
  let th;
  let debug;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async () => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildAdminTestHarness(true, apiKey, groupId, serverUrl);
    await th.configureUserpass();
    await th.createUser();

    debug = th.app().debug();
    await createTestFunction(th.app().functions());
  });

  afterEach(async () => th.cleanup());

  it("Supports executing the function", async () => {
    const result = await debug.executeFunction(th.user.id, FUNC_NAME, 777, 23);

    expect(result.result.sum).toEqual({ $numberDouble: "800" });
    expect(result.result.userId).toEqual(th.user.id);
  });

  it("Supports executing a function source with an eval script", async () => {
    const result = await debug.executeFunctionSource({
      userId: th.user.id,
      source:
        "exports = function(arg1, arg2) { return {sum: 800 + arg1 + arg2, userId: context.user.id } }",
      evalSource: "exports(1,5)"
    });

    expect(result.result.sum).toEqual({ $numberDouble: "806" });
    expect(result.result.userId).toEqual(th.user.id);
  });

  it("Supports executing a function source with an eval script as system user", async () => {
    const systemUserId = "";
    const result = await debug.executeFunctionSource({
      runAsSystem: "true",
      source:
        "exports = function(arg1, arg2) { return {sum: 800 + arg1 + arg2, userId: context.user.id } }",
      evalSource: "exports(1,5)"
    });

    expect(result.result.sum).toEqual({ $numberDouble: "806" });
    expect(result.result.userId).toEqual(systemUserId);
  });
});
