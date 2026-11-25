import { Grid } from "@mui/material";
import type { ProductResponse } from "@/types/api";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductResponse[] }) {
  return (
    <Grid container spacing={2.5}>
      {products.map((p) => (
        <Grid key={p.id} item xs={6} sm={4} md={3}>
          <ProductCard product={p} />
        </Grid>
      ))}
    </Grid>
  );
}
