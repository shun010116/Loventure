// pages/diary.tsx
"use client"

import React, {useState } from "react"
import dayjs from "dayjs"
import {motion, AnimatePresence } from "framer-motion"
import { spec } from "node:test/reporters"

export default function Diary() {
	const [currentDate, setCurrentDate] = useState(dayjs())
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedWeather, setSelectedWeather] = useState<string | null>(null)

	const startOfMonth = currentDate.startOf("month").startOf("week")
	const endOfMonth = currentDate.endOf("month").endOf("week")
	const days = []
	let day = startOfMonth


	while (day.isBefore(endOfMonth)) {
		days.push(day)
		day = day.add(1, "day")
	}


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
							return (
								<div 
									key = { formatted }
									className="border rounded cursor-pointer p-2 h-24 hover:bg-blue-100 flex flex-col items-start"
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
						<input
							type="text"
							placeholder="제목을 적어주세요"
							className="text-xl font-bold p-3 border rounded-md w-full"
						/>

						<div className="flex items-center gap-4">
							<label className="text-sm font-medium whitespace-nowrap">오늘의 날씨는?</label>

							<div className="flex gap-2"> 
								{ ["☀️", "⛅", "🌧️", "❄️"].map( (weather) => (
									<button
										key = { weather }
										onClick = { () => setSelectedWeather(weather)}
										className={`text-2xl p-2 rounded-full transition
											${selectedWeather == weather
												? "bg-blue-100 ring-1 ring-blue-400"
												: "hover:bg-gray-100"}`}
									>
										{weather}
									</button>
								))}
							</div>
						</div>

						{/* 일기장 content */}
						<textarea
							placeholder="오늘의 일기를 적어주세요"
							className="h-80 p-4 border rounded resize-none outline-none"
						/>
						<div className="flex justify-end">
							<button
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
								onClick = { () => alert("저장하기")}
							>
								작성완료
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}