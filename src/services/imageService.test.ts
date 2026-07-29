import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosImageManager } from "./axios";
import { getImageFromMongoDB } from "./imageService";

vi.mock("./axios", () => ({
  axiosImageManager: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosImageManager.get);

describe("image manager URL", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("uses only the official base URL in production", () => {
    const env = readFileSync(resolve(process.cwd(), ".env.production"), "utf8");
    expect(env).toContain(
      "VITE_IMAGE_MANAGER_URL=https://fertintelligence-image-api.onrender.com"
    );
    expect(env).not.toContain("/get");
    expect(env).not.toContain("fertintelligence-image-manager-1.onrender.com");
  });

  it("calls /get/:id once, without duplicating the route", async () => {
    mockedGet.mockResolvedValue({ data: { image: "data:image/png;base64,abc" } });
    await expect(getImageFromMongoDB("image-id")).resolves.toBe(
      "data:image/png;base64,abc"
    );
    expect(mockedGet).toHaveBeenCalledWith("/get/image-id", expect.any(Object));
    expect(mockedGet.mock.calls[0][0]).not.toContain("/get/get/");
  });

  it.each([404, 500])("keeps 404/network-style failures controlled (%s)", async (status) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockedGet.mockRejectedValue(
      status === 404
        ? new AxiosError("Not found", "ERR_BAD_REQUEST", undefined, undefined, {
            status: 404,
          } as never)
        : new AxiosError("Network error", "ERR_NETWORK")
    );
    await expect(getImageFromMongoDB("missing")).resolves.toBeUndefined();
  });
});
