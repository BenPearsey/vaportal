/** resources/js/lib/products.ts
 *  Central place for product slugs, labels and <select> helper.
 */

/* ── canonical list (slug → label) ─────────────────────────────── */
export const productOptions = [
  { slug: 'annuity',                label: 'Annuity' },
  { slug: 'iul',                    label: 'IUL' },
  { slug: 'whole_life',             label: 'Whole Life' },
  { slug: '10_term',                label: '10 Year Term Life' },
  { slug: '20_term',                label: '20 Year Term Life' },
  { slug: '30_term',                label: '30 Year Term Life' },
  { slug: 'final_expense',          label: 'Final Expense' },
  { slug: 'precious_metals',        label: 'Precious Metals' },
  { slug: 'irrevocable_trust',      label: 'Irrevocable Spendthrift Trust' },
  { slug: 'revocable_trust',        label: 'Revocable Living Trust' },
  { slug: 'guaranteed_life',        label: 'Guaranteed Life' },
  { slug: 'medicare',               label: 'Medicare' },
] as const;

/* quick lookup: slug ⇒ pretty label */
export function productLabel (slug: string): string {
  return (
    productOptions.find(p => p.slug === slug)?.label ??
    slug.replace(/_/g, ' ')          // graceful fallback
  );
}
