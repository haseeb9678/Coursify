
"use client";

import { useMemo, useState } from "react";

import { catalogCourses } from "../data/catalog-courses.data";
import {
    initialFilters,
    PAGE_SIZE,
    type Filters,
    type FilterKey,
} from "../types/catalog.types";

export default function useCourseCatalog() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("popular");
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const updateFilter = (
        key: FilterKey,
        value: string,
        checked: boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: checked
                ? [...prev[key], value]
                : prev[key].filter((item) => item !== value),
        }));

        setPage(1);
    };

    const updateRating = (rating: number) => {
        setFilters((prev) => ({ ...prev, rating }));
        setPage(1);
    };

    const updateCertificate = (certificate: boolean) => {
        setFilters((prev) => ({ ...prev, certificate }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setSearch("");
        setPage(1);
    };

    const removeFilter = (value: string) => {
        setFilters((prev) => ({
            categories: prev.categories.filter((item) => item !== value),
            levels: prev.levels.filter((item) => item !== value),
            durations: prev.durations.filter((item) => item !== value),
            prices: prev.prices.filter((item) => item !== value),
            rating: value.endsWith("+ Stars") ? 0 : prev.rating,
            certificate:
                value === "Certificate Included" ? false : prev.certificate,
        }));

        setPage(1);
    };

    const filteredCourses = useMemo(() => {
        let result = [...catalogCourses];

        const query = search.trim().toLowerCase();

        if (query) {
            result = result.filter((course) =>
                [
                    course.title,
                    course.instructor,
                    course.category,
                    course.level,
                ].some((value) => value.toLowerCase().includes(query))
            );
        }

        if (filters.categories.length) {
            result = result.filter((course) =>
                filters.categories.includes(course.category)
            );
        }

        if (filters.levels.length) {
            result = result.filter((course) =>
                filters.levels.includes(course.level)
            );
        }

        if (filters.durations.length) {
            result = result.filter((course) =>
                filters.durations.some((duration) => {
                    if (duration === "0–5 Hours") return course.duration <= 5;

                    if (duration === "5–15 Hours") {
                        return course.duration > 5 && course.duration <= 15;
                    }

                    return course.duration > 15;
                })
            );
        }

        if (filters.prices.length) {
            result = result.filter((course) =>
                filters.prices.some((price) =>
                    price === "Free Courses"
                        ? course.price === 0
                        : course.price > 0
                )
            );
        }

        if (filters.rating > 0) {
            result = result.filter(
                (course) => course.rating >= filters.rating
            );
        }

        if (filters.certificate) {
            result = result.filter((course) => course.certificate);
        }

        switch (sort) {
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;

            case "newest":
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                break;

            default:
                result.sort((a, b) => b.popularity - a.popularity);
        }

        return result;
    }, [search, filters, sort]);

    const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);

    const paginatedCourses = useMemo(
        () =>
            filteredCourses.slice(
                (page - 1) * PAGE_SIZE,
                page * PAGE_SIZE
            ),
        [filteredCourses, page]
    );

    const activeFilters = [
        ...filters.categories,
        ...filters.levels,
        ...filters.durations,
        ...filters.prices,
        ...(filters.rating > 0 ? [`${filters.rating}+ Stars`] : []),
        ...(filters.certificate ? ["Certificate Included"] : []),
    ];

    const activeFilterCount = activeFilters.length;

    return {
        search,
        setSearch,
        sort,
        setSort,
        page,
        setPage,
        filters,
        updateFilter,
        updateRating,
        updateCertificate,
        resetFilters,
        removeFilter,
        filteredCourses,
        paginatedCourses,
        totalPages,
        activeFilters,
        activeFilterCount,
        pageSize: PAGE_SIZE,
    };
}
