import { Decimal } from "prisma/generated/prisma/internal/prismaNamespace";

export const toDecimal = (v: string | number | Decimal): Decimal => {
  if (v instanceof Decimal) return v;
  return new Decimal(v);
};

export const dec0 = () => new Decimal(0);
