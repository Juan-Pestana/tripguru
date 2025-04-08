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
import { Coffee, UtensilsCrossed, Store, Fuel, Baby } from "lucide-react";
import { Toaster, toast } from "sonner";

const categories = [
	{
		id: "snacks",
		label: "Snacks & Coffee",
		icon: Coffee,
		description: "Great for quick bites and coffee breaks",
	},
	{
		id: "menu",
		label: "Full Menu",
		icon: UtensilsCrossed,
		description: "Complete dining experience",
	},
	{
		id: "store",
		label: "Local Products Store",
		icon: Store,
		description: "Local and convenience items",
	},
	{
		id: "gas",
		label: "Gas & Go",
		icon: Fuel,
		description: "Quick refueling service",
	},
	{
		id: "kids",
		label: "Kids Area",
		icon: Baby,
		description: "great for families with children",
	},
];

function App() {
	// const { toast } = useToast();
	const [primaryCategory, setPrimaryCategory] = useState<string>("");
	const [secondaryCategory, setSecondaryCategory] = useState<string>("");
	const [appreciation, setAppreciation] = useState("");
	const [recommendation, setRecommendation] = useState("");

	const handleCategorySelect = (categoryId: string) => {
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

	const handleSubmit = () => {
		if (!primaryCategory) {
			toast("Please select at least one category.");
			return;
		}

		toast("Feedback submitted successfully!", {
			duration: 3000,
		});

		// Reset form
		setPrimaryCategory("");
		setSecondaryCategory("");
		setAppreciation("");
		setRecommendation("");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
			<div className="max-w-2xl mx-auto">
				<Card className="shadow-xl">
					<CardHeader>
						<CardTitle className="text-2xl md:text-3xl text-center text-gray-800">
							Rate Your Service Station Experience
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">
									What was best about this station?
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
											<div className="text-xs text-muted-foreground text-center">
												{category.description}
											</div>
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

export default App;
