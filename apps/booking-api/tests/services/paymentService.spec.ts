import { describe, it, expect, vi } from "vitest";
import { PaymentService } from "../../src/services/paymentService.js";
import { PaymentProvider } from "../../src/providers/paymentProvider.js";
import { MockPaymentProvider } from "../../src/providers/mockPaymentProvider.js";

describe("PaymentService", () => {
  it("should successfully process payment via injected PaymentProvider", async () => {
    const mockProvider: PaymentProvider = {
      processPayment: vi.fn().mockResolvedValue({
        paymentId: "test_pay_123",
        status: "succeeded",
        amount: 50,
        currency: "EUR",
        createdAt: "2026-10-07T10:00:00.000Z",
      }),
      refundPayment: vi.fn(),
    };

    const service = new PaymentService(mockProvider);
    const result = await service.processPayment(50, "EUR");

    expect(mockProvider.processPayment).toHaveBeenCalledWith(50, "EUR");
    expect(result).toEqual({
      paymentId: "test_pay_123",
      status: "succeeded",
      amount: 50,
      currency: "EUR",
      createdAt: "2026-10-07T10:00:00.000Z",
    });
  });

  it("should use default currency EUR if none provided", async () => {
    const mockProvider: PaymentProvider = {
      processPayment: vi.fn().mockResolvedValue({
        paymentId: "test_pay_default",
        status: "succeeded",
        amount: 25,
        currency: "EUR",
        createdAt: "2026-10-07T10:00:00.000Z",
      }),
      refundPayment: vi.fn(),
    };

    const service = new PaymentService(mockProvider);
    await service.processPayment(25);

    expect(mockProvider.processPayment).toHaveBeenCalledWith(25, "EUR");
  });

  it("should throw error if payment amount is less than or equal to zero", async () => {
    const mockProvider: PaymentProvider = {
      processPayment: vi.fn(),
      refundPayment: vi.fn(),
    };

    const service = new PaymentService(mockProvider);

    await expect(service.processPayment(0)).rejects.toThrow(
      "Payment amount must be greater than zero"
    );
    await expect(service.processPayment(-10)).rejects.toThrow(
      "Payment amount must be greater than zero"
    );
    expect(mockProvider.processPayment).not.toHaveBeenCalled();
  });

  it("should successfully refund payment via injected PaymentProvider", async () => {
    const mockProvider: PaymentProvider = {
      processPayment: vi.fn(),
      refundPayment: vi.fn().mockResolvedValue({
        refundId: "test_ref_123",
        paymentId: "test_pay_123",
        status: "succeeded",
        refundedAt: "2026-10-07T10:05:00.000Z",
      }),
    };

    const service = new PaymentService(mockProvider);
    const result = await service.refundPayment("test_pay_123");

    expect(mockProvider.refundPayment).toHaveBeenCalledWith("test_pay_123");
    expect(result).toEqual({
      refundId: "test_ref_123",
      paymentId: "test_pay_123",
      status: "succeeded",
      refundedAt: "2026-10-07T10:05:00.000Z",
    });
  });

  it("should throw error if paymentId is empty or invalid on refund", async () => {
    const mockProvider: PaymentProvider = {
      processPayment: vi.fn(),
      refundPayment: vi.fn(),
    };

    const service = new PaymentService(mockProvider);

    await expect(service.refundPayment("")).rejects.toThrow(
      "A valid paymentId is required to issue a refund"
    );
    await expect(service.refundPayment("   ")).rejects.toThrow(
      "A valid paymentId is required to issue a refund"
    );
    // @ts-expect-error test invalid type at runtime
    await expect(service.refundPayment(null)).rejects.toThrow(
      "A valid paymentId is required to issue a refund"
    );
    expect(mockProvider.refundPayment).not.toHaveBeenCalled();
  });
});

describe("MockPaymentProvider", () => {
  it("should generate valid payment results with mock ids", async () => {
    const provider = new MockPaymentProvider();
    const res = await provider.processPayment(100, "USD");

    expect(res.status).toBe("succeeded");
    expect(res.amount).toBe(100);
    expect(res.currency).toBe("USD");
    expect(res.paymentId).toMatch(/^mock_pay_\d+_/);
    expect(res.createdAt).toBeDefined();
  });

  it("should generate valid refund results with mock ids", async () => {
    const provider = new MockPaymentProvider();
    const res = await provider.refundPayment("mock_pay_123");

    expect(res.status).toBe("succeeded");
    expect(res.paymentId).toBe("mock_pay_123");
    expect(res.refundId).toMatch(/^mock_ref_\d+_/);
    expect(res.refundedAt).toBeDefined();
  });
});

