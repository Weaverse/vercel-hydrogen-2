import { Image } from "~/components/image";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type { MediaFragment } from "storefrontapi.generated";
import { FreeMode, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import { ZoomModal } from "./media-zoom";
import { MagnifyingGlassPlus } from "@phosphor-icons/react";

interface ProductMediaProps {
  selectedVariant: any;
  media: MediaFragment[];
  showThumbnails: boolean;
  imageAspectRatio: string;
  spacing: number;
  showSlideCounter: boolean;
  direction?: "horizontal" | "vertical";
  enableZoom?: boolean;
}

export function ProductMedia(props: ProductMediaProps) {
  let {
    selectedVariant,
    showThumbnails,
    media: _media,
    imageAspectRatio,
    spacing,
    showSlideCounter,
    direction = "horizontal",
    enableZoom,
  } = props;
  let media = _media.filter((med) => med.__typename === "MediaImage");
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null
  );
  let [zoomMediaId, setZoomMediaId] = useState<string | null>(null);
  let [zoomModalOpen, setZoomModalOpen] = useState(false);
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
    <div className="overflow-hidden product-media-slider">
      <div
        className={clsx(
          "flex gap-4 overflow-hidden [--thumbs-width:0px]",
          direction === "horizontal" ? "flex-col" : "flex-row-reverse",
          showThumbnails && "md:[--thumbs-width:8rem]"
        )}
      >
        <div
          data-motion="zoom-in"
          className={clsx(
            "relative",
            direction === "vertical" &&
              "w-[calc(100%-var(--thumbs-width,0px))] h-full"
          )}
        >
          <Swiper
            loop={true}
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
            className="vt-product-image max-w-full !pb-5 md:!pb-0 md:[&_.swiper-pagination-bullets]:hidden mySwiper2"
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
                  {enableZoom && (
                  <button
                    type="button"
                    className={clsx(
                      "absolute top-2 right-2 md:right-6 md:top-6",
                      "p-2 text-center border border-transparent rounded-full",
                      "transition-all duration-200",
                      "text-gray-900 bg-transparent hover:bg-[#2e6a53] hover:text-white",
                    )}
                    onClick={() => {
                      setZoomMediaId(med.id);
                      setZoomModalOpen(true);
                    }}
                  >
                    <MagnifyingGlassPlus className="w-5 h-5" />
                  </button>
                )}
                </SwiperSlide>
              );
            })}
          </Swiper>
          {showSlideCounter && (
            <span className="absolute bottom-7 sm:bottom-5 right-2 text-text-primary text-sm sm:text-base z-10 font-heading">
              {activeIndex + 1}/{media.length}
            </span>
          )}
        </div>
        {showThumbnails && (
          <div
            className={clsx(
              "hidden sm:block",
              direction === "vertical" &&
                "w-[calc(var(--thumbs-width,0px)-1rem)] h-[450px]"
            )}
          >
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={false}
              rewind
              direction={direction}
              spaceBetween={spacing}
              freeMode={true}
              slidesPerView={"auto"}
              modules={[FreeMode, Thumbs]}
              watchSlidesProgress={true}
              data-motion="fade-up"
              className="w-full h-full overflow-visible mySwiper"
            >
              {media.map((med, i) => {
                let image = {
                  ...med.image,
                  altText: med.alt || "Product image",
                };
                return (
                  <SwiperSlide
                    key={med.id}
                    className={clsx(
                      "!h-fit !w-fit border-2 transition-colors cursor-pointer rounded p-0.5",
                      activeIndex === i ? "border-border" : "border-transparent"
                    )}
                  >
                    <Image
                      data={image}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="fadeIn object-cover !h-[100px] rounded shadow-md"
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
      {enableZoom && (
        <ZoomModal
          media={media}
          zoomMediaId={zoomMediaId ?? ""}
          setZoomMediaId={setZoomMediaId}
          open={zoomModalOpen}
          onOpenChange={setZoomModalOpen}
        />
      )}
    </div>
  );
}
