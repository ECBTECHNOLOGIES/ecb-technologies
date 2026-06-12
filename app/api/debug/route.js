export async function GET() {
  try {
    const url = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3/products?consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}&per_page=1`
    const res = await fetch(url)
    const data = await res.json()
    return Response.json({
      status: res.status,
      hasProducts: Array.isArray(data),
      productCount: Array.isArray(data) ? data.length : 0,
      error: Array.isArray(data) ? null : data
    })
  } catch (error) {
    return Response.json({ error: error.message })
  }
}
