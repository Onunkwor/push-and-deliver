import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ecommerceMerchantsService } from "@/services/ecommerce-merchants.service";
import type { Product, ProductVariant } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductDetailsPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && productId) {
      loadProductData();
    }
  }, [id, productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const productData = await ecommerceMerchantsService.getProductById(
        id!,
        productId!
      );

      if (!productData) {
        toast.error("Product not found");
        navigate(`/ecommerce-merchants/${id}/products`);
        return;
      }

      setProduct(productData);

      // Load variants if product has them
      if (productData.hasVariants) {
        const variantsData = await ecommerceMerchantsService.getProductVariants(
          id!,
          productId!
        );
        setVariants(variantsData);

        // Set first variant as selected by default
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  // Get current display data - variant takes precedence if selected
  const getCurrentData = () => {
    return selectedVariant || product;
  };

  const getCurrentImages = () => {
    return getCurrentData()?.imageUrls || [];
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = getCurrentImages();
  const currentData = getCurrentData();
  const hasColorList = product.colorList && product.colorList.length > 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/ecommerce-merchants/${id}/products`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentData?.name || "Product Details"}
          </h1>
          <p className="text-muted-foreground">
            {product.category && (
              <Badge variant="outline">{product.category}</Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <Card>
          <CardContent className="p-6">
            {images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="rounded-lg"
                style={{ "--swiper-theme-color": "#000" } as any}
              >
                {images.map((imageUrl, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={imageUrl}
                      alt={`${currentData?.name || "Product"} ${idx + 1}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No images available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product/Variant Info */}
        <div className="space-y-6">
          {/* Main Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedVariant ? "Variant Details" : "Product Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">
                    ₦{(currentData?.price || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="text-2xl font-bold">
                    {currentData?.stock || 0}
                  </p>
                </div>
              </div>

              {currentData?.color && (
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium capitalize">{currentData.color}</p>
                </div>
              )}

              {currentData?.sizeList && currentData.sizeList.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Available Sizes
                  </p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {currentData.sizeList.map((size, idx) => (
                      <Badge key={idx} variant="secondary">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants Section */}
          {product.hasVariants && variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {hasColorList ? "Select Color" : "Select Variant"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant, idx) => (
                    <Button
                      key={variant.id || idx}
                      variant={
                        selectedVariant?.id === variant.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleVariantSelect(variant)}
                      className="flex flex-col items-start h-auto p-3"
                    >
                      <span className="font-semibold">
                        {hasColorList
                          ? variant.color || `Color ${idx + 1}`
                          : variant.name || `Variant ${idx + 1}`}
                      </span>
                      {variant.price && (
                        <span className="text-xs">
                          ₦{variant.price.toLocaleString()}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vendor Info */}
          {product.vendorName && (
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{product.vendorName}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
