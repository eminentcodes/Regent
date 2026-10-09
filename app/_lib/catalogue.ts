import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { StoreCategory, StoreProduct } from './store'

const CATEGORIES: Record<string, { id: string; label: string; image: string; alt: string }> = {
  'Staples': { id: 'staples', label: 'Pantry staples', image: 'rice', alt: 'Rice and pantry staples' },
  'Cooking essentials': { id: 'cooking', label: 'Cooking essentials', image: 'tomatoes', alt: 'Fresh tomatoes for cooking' },
  'Proteins': { id: 'proteins', label: 'Meat, fish & eggs', image: 'eggs', alt: 'Eggs from the protein selection' },
  'Dairy, bread and breakfast': { id: 'breakfast', label: 'Breakfast & dairy', image: 'bread', alt: 'Bread for the breakfast table' },
  'Drinks': { id: 'drinks', label: 'Drinks', image: 'drinks', alt: 'A glass of fruit juice' },
  'Provisions and baking': { id: 'baking', label: 'Baking & provisions', image: 'rice', alt: 'A selection of pantry ingredients' },
  'Household and cleaning': { id: 'household', label: 'Household', image: 'household', alt: 'Everyday household essentials' },
  'Fresh produce': { id: 'fresh-produce', label: 'Fresh produce', image: 'market-produce', alt: 'A selection of fresh vegetables' },
  'Baby and personal care': { id: 'personal-care', label: 'Baby & personal care', image: 'household', alt: 'Everyday care essentials' },
}

const PRODUCT_IMAGES = [
  { match: /^Beans/, image: 'beans', alt: 'Illustrative selection of dried beans' },
  { match: /^(Rice|Garri|Semovita|Yam flour|Sugar|Custard|Cornflakes|Golden Morn)/, image: 'rice', alt: 'Illustrative pantry ingredients' },
  { match: /^Bread/, image: 'bread', alt: 'Illustrative freshly baked bread' },
  { match: /^Eggs/, image: 'eggs', alt: 'Illustrative tray of eggs' },
  { match: /^(Chicken|Turkey|Goat meat|Cow meat|Fish)/, image: 'proteins', alt: 'Illustrative selection from the meat category' },
  { match: /^Fresh tomatoes/, image: 'tomatoes', alt: 'Illustrative fresh tomatoes' },
  { match: /^Bananas/, image: 'bananas', alt: 'Illustrative bunch of bananas' },
  { match: /^Apples/, image: 'apples', alt: 'Illustrative fresh apples' },
  { match: /^(Milk|Yoghurt|Butter|Cheese)/, image: 'dairy', alt: 'Illustrative dairy selection' },
]

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** The storefront and Reggie read the same catalogue; prices are not duplicated. */
export async function getStoreCatalogue(): Promise<{ products: StoreProduct[]; categories: StoreCategory[] }> {
  const source = await readFile(path.join(process.cwd(), 'knowledge', 'catalogue.md'), 'utf8')
  const products: StoreProduct[] = []
  let category: (typeof CATEGORIES)[string] | undefined

  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith('## ')) {
      category = CATEGORIES[line.slice(3).trim()]
      continue
    }
    const item = /^- (.+) - (\d+)\s*$/.exec(line)
    if (!category || !item) continue

    const name = item[1].trim()
    const parts = name.split(', ')
    const size = parts.length > 1 ? parts.pop()! : ''
    const photo = PRODUCT_IMAGES.find(({ match }) => match.test(name))
    products.push({
      id: slug(name),
      name,
      title: parts.join(', '),
      size,
      price: Number(item[2]),
      category: category.id,
      image: '/images/' + (photo?.image ?? category.image) + '.jpg',
      imageAlt: photo?.alt ?? 'Illustrative photo: ' + category.alt.toLowerCase(),
    })
  }

  // Put a useful mix of fresh food and essentials at the front of the shelf.
  const featured = ['Fresh tomatoes, basket', 'Rice, Mama Gold long grain, 5kg', 'Eggs, crate of 30', 'Bananas, bunch',
    'Bread, sliced agege loaf', 'Milk, Peak powdered, 400g tin', 'Apples, pack of 6', 'Chicken, whole frozen, 1.5kg']
  products.sort((a, b) => {
    const aIndex = featured.indexOf(a.name)
    const bIndex = featured.indexOf(b.name)
    return (aIndex < 0 ? featured.length : aIndex) - (bIndex < 0 ? featured.length : bIndex)
  })

  const categoryOrder = ['fresh-produce', 'staples', 'cooking', 'proteins', 'breakfast', 'drinks', 'baking', 'household', 'personal-care']
  const categories = Object.values(CATEGORIES).map(({ id, label }) => ({
    id, label, count: products.filter((product) => product.category === id).length,
  })).sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id))

  return { products, categories }
}
