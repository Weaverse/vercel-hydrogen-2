import { Await, Form, useLoaderData } from '@remix-run/react';
import { getPaginationVariables, Pagination } from '@shopify/hydrogen';
import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Suspense } from 'react';
import {
  Heading,
  PageHeader,
  Section,
  Text,
} from '~/components/Text';
import { ProductSwimlane } from '~/components/ProductSwimlane';
import { ProductCard } from '~/components/ProductCard';
import { Input } from '~/components/Input';
import { Grid } from '~/components/Grid';
import { FeaturedCollections } from '~/components/FeaturedCollections';
import { PRODUCT_CARD_FRAGMENT } from '~/data/fragments';
import { getImageLoadingPriority, PAGINATION_SIZE } from '~/lib/const';
import { seoPayload } from '~/lib/seo.server';
import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';
import { IconSearch } from '~/components/Icon';
import { Button } from '@/components/ui/button';

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const variables = getPaginationVariables(request, { pageBy: PAGINATION_SIZE });

  const { products } = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm,
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const shouldGetRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: 'Search',
      handle: 'search',
      descriptionHtml: 'Search results',
      description: 'Search results',
      seo: {
        title: 'Search',
        description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return defer({
    seo,
    searchTerm,
    products,
    noResultRecommendations: shouldGetRecommendations
      ? getNoResultRecommendations(storefront)
      : Promise.resolve(null),
  });
}

export default function Search() {
  const { searchTerm, products, noResultRecommendations } =
    useLoaderData<typeof loader>();
  const noResults = products?.nodes?.length === 0;

  return (
    <>
      <PageHeader className='bg-background-subtle-1 items-center justify-center'>
        <Heading as="h1" size="display" className='flex justify-center items-center'>
          {searchTerm && `Search results for “${searchTerm}”`}
          {!searchTerm && 'Search our site'}
        </Heading>
        <Form method="get" className="relative flex justify-center items-center w-full">
          <button type="submit" className='absolute left-0 ml-3 mt-2 cursor-pointer'>
            <IconSearch className=" !w-8 !h-8 opacity-55" viewBox="0 0 24 24" />
          </button>
          <Input
            defaultValue={searchTerm}
            name="q"
            placeholder="What are you looking for?"
            className='!w-[400px] !bg-inherit !rounded border-2 border-bar-subtle pl-11'
            type="search"
            variant="search"
          />
        </Form>
      </PageHeader>
      {!searchTerm || noResults ? (
        <NoResults
          noResults={noResults}
          recommendations={noResultRecommendations}
        />
      ) : (
        <Section>
          <Pagination connection={products}>
            {({ nodes, isLoading, NextLink, PreviousLink }) => {
              const itemsMarkup = nodes.map((product: any, i: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="flex items-center justify-center mt-6">
                    <Button
                      as={PreviousLink}
                      variant="secondary"
                    >
                      {isLoading ? 'Loading...' : 'Previous'}
                    </Button>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                  <div className="flex items-center justify-center mt-6">
                    <Button
                      as={NextLink}
                      variant="secondary"
                    >
                      {isLoading ? 'Loading...' : 'Show more +'}
                    </Button>
                  </div>
                </>
              );
            }}
          </Pagination>
        </Section>
      )}
    </>
  );
}

function NoResults({
  noResults,
  recommendations,
}: {
  noResults: boolean;
  recommendations: Promise<null | FeaturedData>;
}) {
  const { products } =
    useLoaderData<typeof loader>();
  return (
    <>
      {noResults && (
        <Section padding="x">
          <Text className="opacity-50">
            No results, try a different search.
          </Text>
        </Section>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(result) => {
            if (!result) return null;
            // const { featuredCollections, featuredProducts } = result;

            return (
              <>
                {/* <FeaturedCollections
                  title="Trending Collections"
                  collections={featuredCollections}
                /> */}
                {/* <ProductSwimlane
                  title="Trending Products"
                  products={featuredProducts}
                /> */}
                <Section>
                  <Pagination connection={products}>
                    {({ nodes, isLoading, NextLink, PreviousLink }) => {
                      const itemsMarkup = nodes.map((product: any, i: number) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          loading={getImageLoadingPriority(i)}
                        />
                      ));

                      return (
                        <>
                          <div className="flex items-center justify-center mt-6">
                            <Button
                              as={PreviousLink}
                              variant="secondary"
                            >
                              {isLoading ? 'Loading...' : 'Previous'}
                            </Button>
                          </div>
                          <Grid data-test="product-grid">{itemsMarkup}</Grid>
                          <div className="flex items-center justify-center mt-6">
                            <Button
                              as={NextLink}
                              variant="secondary"
                            >
                              {isLoading ? 'Loading...' : 'Show more +'}
                            </Button>
                          </div>
                        </>
                      );
                    }}
                  </Pagination>
                </Section>
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export function getNoResultRecommendations(
  storefront: LoaderFunctionArgs['context']['storefront'],
) {
  return getFeaturedData(storefront, { pageBy: PAGINATION_SIZE });
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: RELEVANCE,
      query: $searchTerm
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
` as const;
