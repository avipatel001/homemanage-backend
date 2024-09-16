import { Entry } from "../models/entrys.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createEntry = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { id, type, amount, date, category, userId, description } =
    req.body.data;

  if (!id || !type || !amount || !date || !category || !userId) {
    throw new ApiError(400, "All fields are required");
  }

  const entry = await Entry.create({
    id,
    type,
    amount,
    date,
    category,
    description,
    userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, entry, "Entry created successfully"));
});

const getEntryByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get the current month and year
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = today.getFullYear();

  // Fetch entries for the user
  const entries = await Entry.find({ userId: userId });

  // Filter entries that match the current month and year
  const filteredEntries = entries.filter((entry) => {
    // Assuming the date is stored in entry.date as a string in DD-MM-YYYY format
    const [day, month, year] = entry.date.split("-").map(Number);

    return month === currentMonth && year === currentYear;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        filteredEntries,
        "Entries for the current month retrieved successfully"
      )
    );
});

const getEntryByMonth = asyncHandler(async (req, res) => {
  const { userId, month, year } = req.params;
  console.log(userId, month, year);

  const entries = await Entry.find({ userId: userId });

  const filteredEntries = entries.filter((entry) => {
    // Assuming the date is stored in entry.date as a string in DD-MM-YYYY format
    const [day, entryMonth, entryYear] = entry.date.split("-").map(Number);

    // Convert month parameter to a number and compare with the entryMonth (entryMonth is 1-based)
    return entryMonth === parseInt(month) && entryYear === parseInt(year);
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        filteredEntries,
        "Entries for the current month retrieved successfully"
      )
    );
});

const getAllEntry = asyncHandler(async (req, res) => {
  const entries = await Entry.find();
  return res
    .status(200)
    .json(new ApiResponse(200, entries, "All entries retrieved successfully"));
});

export { createEntry, getEntryByUserId, getEntryByMonth, getAllEntry };
