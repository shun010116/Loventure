// pages/diary.tsx
"use client"

import React, { useState, useEffect } from "react"
import dayjs from "dayjs"
import {motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import ClientLayout from "@/app/ClientLayout";

interface Journal {
	_id: string;
	date: string;
	title: string;
	content: string;
	mood?: string;
	weather?: string;
	createdAt: string;
	senderId: {
		_id: string;
		nickname: string;
		profileImage: string;
	};
	isReadBy?: string[];
}

export default function Diary() {
	const router = useRouter();
	const { isLoggedIn, loading, user } = useAuth();

	const [currentDate, setCurrentDate] = useState(dayjs())
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedWeather, setSelectedWeather] = useState<string | null>(null)
	const [journals, setJournals] = useState<Journal[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [mood, setMood] = useState("");
	const [partnerId, setPartnerId] = useState<string | null>(null);

	const startOfMonth = currentDate.startOf("month").startOf("week")
	const endOfMonth = currentDate.endOf("month").endOf("week")
	const days = []
	let day = startOfMonth

	const weatherEmojiMap: { [key: string]: string } = {
		"☀️": "sunny",
		"⛅": "cloudy",
		"🌧️": "rainy",
		"❄️": "snowy",
	  };
	const weatherCodeToEmoji = Object.fromEntries(
		Object.entries(weatherEmojiMap).map(([emoji, code]) => [code, emoji])
	);

	const fetchJournals = async () => {
		try {
			const res = await fetch("/api/journal");
			const data = await res.json();
			//console.log("data:", data);
			if (res.ok && data.data?.journals) {
				setJournals(data.data.journals);
				setPartnerId(data.data.partnerId);
			}
		} catch (err) {
			console.error("Error fetching journals:", err);
		}
	};

	useEffect(() => {
		if (!loading && !isLoggedIn) {
			router.push("/login");
		}
	}, [loading, isLoggedIn, router]);

	useEffect(() => {
		fetchJournals();
	}, []);

	const filteredJournal = journals.find(
		(j) => dayjs(j.date).format("YYYY-MM-DD") === selectedDate
	);
	//console.log("filteredJournal:", filteredJournal)

	useEffect(() => {
		const journalForDate = journals.find(
			(j) => dayjs(j.createdAt).format("YYYY-MM-DD") === selectedDate
		);

		if (journalForDate) {
			setTitle(journalForDate.title || "");
			setContent(journalForDate.content || "");
			setMood(journalForDate.mood || "");
			setSelectedWeather(journalForDate.weather || "");
		} else {
			setTitle("");
			setContent("");
			setMood("");
			setSelectedWeather("");
		}
	}, [selectedDate, journals]);

	const handleSubmit = async () => {
		if (!title.trim() || !content.trim()) {
			alert("Title and content are required.");
			return;
		}
		try {
			const res = await fetch("/api/journal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: selectedDate,
					title,
					content,
					mood,
					weather: weatherEmojiMap[selectedWeather || ""] || "etc",
				}),
			});
			//console.log("status", res.status);
			//console.log("headers:", res.headers);

			let data = null;
			const contentType = res.headers.get("content-type");
			//console.log("contentType:", contentType);
			if (contentType && contentType.includes("application/json")) {
				data = await res.json();
				//console.log("data:", data);
			} else {
				console.warn("Response is not JSON:", res);
			}
			if (res.ok && data?.data.journal) {
				await fetchJournals();
				
				setTitle("");
				setContent("");
				setMood("");
				setSelectedWeather(null);
				setSelectedDate(null);
			} else {
				alert(data.message);
			}
		} catch (err) {
			console.error("Error submitting journal:", err);
		}
	};

	const markAsRead = async (journalId: string) => {
		try {
			const res = await fetch(`/api/journal/${journalId}/read`, {
				method: "PATCH",
			});
			if (res.ok && user) {
				setJournals((prev) =>
					prev.map((j) =>
						j._id === journalId && !j.isReadBy?.includes(user._id)
							? { ...j, isReadBy: [...(j.isReadBy || []), user._id] }
							: j
					)
				);
			}
		} catch (err) {
			console.error("Error marking journal as read:", err);
		}
	}

	useEffect(() => {
		if (!filteredJournal || !user) return;

		const isMine = filteredJournal.senderId._id === user._id;
		const alreadyRead = filteredJournal.isReadBy?.includes(user._id);

		if (!isMine && !alreadyRead) {
			markAsRead(filteredJournal._id);
		}
	}, [filteredJournal, user, journals]);

	while (day.isBefore(endOfMonth)) {
		days.push(day)
		day = day.add(1, "day")
	}

	if (loading || !isLoggedIn || !user) return null;

	return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

			{/* 일기장 등장 효과 */}
			<AnimatePresence mode="wait">
				{!selectedDate ? (
					<motion.div
						key="calendar"
						initial = {{ opacity: 0, scale: 0.95 }}
						animate = {{ opacity: 1, scale: 1}}
						exit = {{opacity: 0, scale: 0.95 }}
						transition = {{ duration: 0.3 }}
						className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-6"
					>

					<div className="flex justify-center mb-4">
						<h2 className="text-xl font-bold text-center">
							일기를 작성할 날짜를 선택해주세요
						</h2>
					</div>

					{/* 달력 header */}
						<div className="flex justify-between items-center mb-4">
							<button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
								◀️
							</button>

							<h2 className="text-xl font-bold">
								{currentDate.format("MMMM YYYY")}
							</h2>

							<button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
								▶️
							</button>
						</div>

					{/* 달력 content */}
					<div className="grid grid-cols-7 gap-2"> 
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map( (d) => (
							<div key={d} className="text-center font-semibold text-sm">{d}</div>
						))}
						{days.map( (d) => {
							const formatted = d.format("YYYY-MM-DD")
							const isWritten = journals.some(j => dayjs(j.date).format("YYYY-MM-DD") === formatted);
							return (
								<div 
									key = { formatted }
									className={`border rounded cursor-pointer p-2 h-24 hover:bg-blue-100 flex flex-col items-start ${isWritten ? "bg-yellow-100" : ""}`}
									onClick={ () => setSelectedDate(formatted) }
								>
									<div className="font-bold text-sm">{d.date()}</div>
								</div>
							)
						})}
					</div>

					</motion.div>

				) : (
					<motion.div
						key="diaryForm"
						initial = {{ opacity: 0, y: 0 }}
						animate = {{ opacity: 1, y: 0 }}
						exit = {{ opacity: 0, y: 30 }}
						transition = {{duration: 0.3 }}
						className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4"
					>

					{/* 날짜 다시 선택(뒤로가기) */}
					<div className="flex items-center justify-between">
						<button
							className="text-xl text-gray-700 hover:underline flex items-center gap-2 px-4 py-2 -ml-4"
							onClick= { () => setSelectedDate(null)}
						>
							<span className="text-2xl">📅</span>
						</button>
					</div>
						<h2 className="text-lg font-semibold mb-1">
							{dayjs(selectedDate).format("YYYY년 MM월 DD일")}의 교환 일기
						</h2>

						{/* ----------일기장 header---------- */}
						{filteredJournal ? (
							<div className="bg-gray-50 p-4 rounded border">
								<p className="text-lg font-bold">제목: {filteredJournal.title}</p>
								<p className="text-sm text-gray-500">
									작성자: {filteredJournal.senderId.nickname}
								</p>
								{filteredJournal.mood && <p>기분: {filteredJournal.mood}</p>}
								{filteredJournal.weather && <p>날씨: {weatherCodeToEmoji[filteredJournal.weather]}</p>}
								<p className="mt-2 whitespace-pre-wrap">{filteredJournal.content}</p>

								{/* ✅ 읽음 상태 표시 */}
								{user && filteredJournal.senderId._id === user._id && (
									<p className="text-xs mt-2">
										{filteredJournal.isReadBy?.includes(partnerId || "")
											? "✅ 상대방 읽음"
											: "📖 상대방 읽지 않음"}
									</p>
								)}
							</div>
						) : (
							<>
								<input
									type="text"
									placeholder="제목을 적어주세요"
									className="text-xl font-bold p-3 border rounded-md w-full"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>

								<div className="flex items-center gap-4">
									<label className="text-sm font-medium whitespace-nowrap">오늘의 날씨는?</label>

									<div className="flex gap-2"> 
										{Object.entries(weatherEmojiMap).map(([emoji, code]) => (
											<button
												key = { code }
												onClick = { () => setSelectedWeather(emoji)}
												className={`text-2xl p-2 rounded-full transition
													${selectedWeather == emoji
														? "bg-blue-100 ring-1 ring-blue-400"
														: "hover:bg-gray-100"}`}
											>
												{emoji}
											</button>
										))}
									</div>
								</div>
								
								{/* 일기장 content */}
								<textarea
									placeholder="오늘의 일기를 적어주세요"
									className="h-80 p-4 border rounded resize-none outline-none"
									value={content}
									onChange={(e) => setContent(e.target.value)}
								/>
								<div className="flex justify-end">
									<button
										className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
										onClick = {handleSubmit}
									>
										작성완료
									</button>
								</div>
							</>
						)}
						
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}