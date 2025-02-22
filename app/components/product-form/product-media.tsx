import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type { MediaFragment } from "storefrontapi.generated";
import { FreeMode, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";

interface ProductMediaProps {
  selectedVariant: any;
  media: MediaFragment[];
  showThumbnails: boolean;
  imageAspectRatio: string;
  spacing: number;
  showSlideCounter: boolean;
}

export function ProductMedia(props: ProductMediaProps) {
  let {
    selectedVariant,
    showThumbnails,
    media: _media,
    imageAspectRatio,
    spacing,
    showSlideCounter,
  } = props;
  let media = _media.filter((med) => med.__typename === "MediaImage");
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null
  );
  let [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (swiperInstance && thumbsSwiper) {
      if (swiperInstance.thumbs) {
        swiperInstance.thumbs.swiper = thumbsSwiper;
        swiperInstance.thumbs.init();
      }
      swiperInstance.on("slideChange", () => {
        const realIndex = swiperInstance.realIndex;
        setActiveIndex(realIndex);
        thumbsSwiper.slideTo(realIndex);
      });
    }
  }, [swiperInstance, thumbsSwiper]);

  return (
    <div className="flex flex-col gap-4 w-full overflow-hidden">
      <div data-motion="zoom-in" className="relative">
        <Swiper
          loop={false}
          modules={[FreeMode, Thumbs, Pagination]}
          pagination={{ type: "bullets" }}
          spaceBetween={10}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          thumbs={
            thumbsSwiper
              ? {
                  swiper: thumbsSwiper,
                  slideThumbActiveClass: "thumb-active",
                }
              : undefined
          }
          onSwiper={setSwiperInstance}
          className="vt-product-image max-w-full !pb-5 !md:pb-0 md:[&_.swiper-pagination-bullets]:hidden mySwiper2"
          style={
            {
              "--swiper-pagination-bottom": "-6px",
              "--swiper-pagination-color": "#3D490B",
            } as React.CSSProperties
          }
        >
          {media.map((med, i) => {
            let image = { ...med.image, altText: med.alt || "Product image" };
            return (
              <SwiperSlide key={med.id}>
                <Image
                  data={image}
                  loading={i === 0 ? "eager" : "lazy"}
                  aspectRatio={imageAspectRatio}
                  className="object-cover w-full h-auto fadeIn rounded"
                  sizes="auto"
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
        {showSlideCounter && (
          <span className="absolute bottom-7 sm:bottom-6 right-2 text-text-primary text-sm sm:text-base z-10 font-heading">
            {activeIndex + 1}/{media.length}
          </span>
        )}
      </div>
      {showThumbnails && (
        <div className="hidden sm:block">
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={false}
            direction="horizontal"
            spaceBetween={spacing}
            freeMode={true}
            slidesPerView={"auto"}
            modules={[FreeMode, Thumbs]}
            watchSlidesProgress={true}
            data-motion="fade-up"
            className="w-full overflow-visible mySwiper"
          >
            {media.map((med, i) => {
              let image = { ...med.image, altText: med.alt || "Product image" };
              return (
                <SwiperSlide
                  key={med.id}
                  className={clsx(
                    "!h-fit !w-fit border-2 transition-colors cursor-pointer rounded",
                    activeIndex === i ? "border-border" : "border-transparent"
                  )}
                >
                  <Image
                    data={image}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="fadeIn object-cover !h-[100px] rounded"
                    aspectRatio={imageAspectRatio}
                    sizes="auto"
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </div>
  );
}
