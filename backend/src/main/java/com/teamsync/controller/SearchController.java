package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.search.SearchResponse;
import com.teamsync.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> searchAll(
            @RequestParam("q") String query) {
        SearchResponse response = searchService.searchAll(query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", response));
    }
}
