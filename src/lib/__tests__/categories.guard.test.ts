import { describe, expect, it, vi, beforeEach } from "vitest";

const { selectMock, transactionMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: selectMock,
    transaction: transactionMock,
  },
}));

import { CategoryError, deleteCategoryWithMigration } from "@/lib/categories";

function mockAllCategories(ids: number[]) {
  selectMock.mockReturnValue({
    from: () => Promise.resolve(ids.map((id) => ({ id }))),
  });
}

beforeEach(() => {
  selectMock.mockReset();
  transactionMock.mockReset();
});

describe("deleteCategoryWithMigration guard logic", () => {
  it("rejects deletion when it is the only category in the system", async () => {
    mockAllCategories([1]);

    await expect(deleteCategoryWithMigration(1, 1)).rejects.toBeInstanceOf(CategoryError);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("proceeds when at least one other category exists and is a valid target", async () => {
    mockAllCategories([1, 2]);
    transactionMock.mockResolvedValue(undefined);

    await deleteCategoryWithMigration(1, 2);

    expect(transactionMock).toHaveBeenCalledTimes(1);
  });
});
