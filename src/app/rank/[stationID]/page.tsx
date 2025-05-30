"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
import {
	Coffee,
	UtensilsCrossed,
	Store,
	Fuel,
	Baby,
	Toilet,
	BadgeEuro,
	Trees,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { rateStation } from "@/actions/rateStation";
import React from "react";

const categories = [
	{
		id: "Snacks & Coffee",
		label: "Snacks & Coffee",
		icon: Coffee,
		description: "Great for quick bites and coffee breaks",
	},
	{
		id: "Full Menu",
		label: "Full Menu",
		icon: UtensilsCrossed,
		description: "Complete dining experience",
	},
	{
		id: "Local Products Store",
		label: "Local Products Store",
		icon: Store,
		description: "Local and convenience items",
	},
	{
		id: "Gas & Go",
		label: "Gas & Go",
		icon: Fuel,
		description: "Quick refueling service",
	},
	{
		id: "Kids Area",
		label: "Kids Area",
		icon: Baby,
		description: "great for families with children",
	},
	{
		id: "Clean Restrooms",
		label: "Clean Restrooms",
		icon: Toilet,
		description: "Clean and well-maintained restrooms",
	},
	{
		id: "Best Price",
		label: "Best Price",
		icon: BadgeEuro,
		description: "Competitive fuel price",
	},
	{
		id: "Beautiful Sights",
		label: "Beautiful Sights",
		icon: Trees,
		description: "Scenic views and nature",
	},
];

function RankPage({ params }: { params: Promise<{ stationID: string }> }) {
	// const { toast } = useToast();
	const [primaryCategory, setPrimaryCategory] = useState<string>("");
	const [secondaryCategory, setSecondaryCategory] = useState<string>("");
	const [appreciation, setAppreciation] = useState("");
	const [recommendation, setRecommendation] = useState("");
	const [starRating, setStarRating] = useState<number>(0);

	const par = React.use(params);

	const handleSubmit = async () => {
		if (!primaryCategory || starRating === 0) {
			toast.error("Please provide a rating and select at least one category.");
			return;
		}

		const result = await rateStation({
			locationId: par.stationID,
			rating: starRating,
			primaryCategory,
			secondaryCategory: secondaryCategory || undefined,
			appreciation: appreciation || undefined,
			recommendation: recommendation || undefined,
		});

		if (result.success) {
			toast.success("Thank you for your feedback!");
			// Reset form
			setPrimaryCategory("");
			setSecondaryCategory("");
			setAppreciation("");
			setRecommendation("");
			setStarRating(0);
		} else {
			toast.error(result.error || "Something went wrong. Please try again.");
		}
	};

	const handleCategorySelect = (categoryId: string) => {
		console.log(categoryId);
		if (primaryCategory === categoryId) {
			setPrimaryCategory("");
		} else if (secondaryCategory === categoryId) {
			setSecondaryCategory("");
		} else if (!primaryCategory) {
			setPrimaryCategory(categoryId);
		} else if (!secondaryCategory && primaryCategory !== categoryId) {
			setSecondaryCategory(categoryId);
		}
	};

	const getCategoryStyle = (categoryId: string) => {
		if (primaryCategory === categoryId) {
			return "ring-2 ring-green bg-green-300 text-secondary-foreground hover:bg-green-200";
		}
		if (secondaryCategory === categoryId) {
			return "ring-2 ring-orange bg-orange-300 text-secondary-foreground hover:bg-orange-200";
		}
		return "";
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2 md:p-8">
			<div className="max-w-2xl mx-auto">
				<Card className="shadow-xl">
					<CardHeader>
						<CardTitle className="text-2xl md:text-3xl text-center text-gray-800">
							Rate Your Service Station Experience
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 px-2 md:px-8">
						<div className="flex flex-col items-center mt-4 space-y-2">
							<h3 className="text-lg font-medium">
								Overall Rating <span className="text-destructive">*</span>
							</h3>
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										onClick={() => setStarRating(star)}
										className="focus:outline-none"
									>
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill={starRating >= star ? "currentColor" : "none"}
											stroke="currentColor"
											className={`w-8 h-8 ${starRating >= star ? "text-yellow-400" : "text-gray-300"}`}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={starRating >= star ? 0 : 1.5}
												d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
											/>
										</svg>
									</button>
								))}
							</div>
							<p className="text-sm font-medium">
								{starRating > 0
									? `${starRating} Star${starRating > 1 ? "s" : ""}`
									: "Tap to rate"}
							</p>
						</div>
						<div className="space-y-4">
							<div className="flex items-center justify-between sm:flex-row flex-col">
								<h3 className="text-lg font-medium">
									What was best about this station?
									<span className="text-destructive"> *</span>
								</h3>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-green-300 rounded-full" />
										<span>Primary</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-orange-300 rounded-full" />
										<span>Secondary</span>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-2 gap-4">
								{categories.map((category) => {
									const Icon = category.icon;
									return (
										<Button
											key={category.id}
											variant="outline"
											className={`h-auto flex flex-col items-center gap-2 p-4 transition-all ${getCategoryStyle(
												category.id,
											)}`}
											onClick={() => handleCategorySelect(category.id)}
										>
											<Icon className="h-6 w-6" />
											<div className="text-sm font-medium">
												{category.label}
											</div>
											<p className="text-xs text-muted-foreground text-center text-wrap">
												{category.description}
											</p>
										</Button>
									);
								})}
							</div>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">
									What did you appreciate most?
								</h3>
								<Textarea
									placeholder="Share what you loved about your experience..."
									value={appreciation}
									onChange={(e) => setAppreciation(e.target.value)}
									className="min-h-[100px]"
								/>
							</div>

							<div className="space-y-2">
								<h3 className="text-lg font-medium">
									Any recommendations for improvement?
								</h3>
								<Textarea
									placeholder="Share your suggestions for making the service even better..."
									value={recommendation}
									onChange={(e) => setRecommendation(e.target.value)}
									className="min-h-[100px]"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full" size="lg" onClick={handleSubmit}>
							Submit Feedback
						</Button>
					</CardFooter>
				</Card>
			</div>
			<Toaster />
		</div>
	);
}

export default RankPage;
