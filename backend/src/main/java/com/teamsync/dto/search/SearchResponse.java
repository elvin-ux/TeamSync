package com.teamsync.dto.search;

import java.util.List;

public record SearchResponse(
        List<ProjectSearchDto> projects,
        List<TaskSearchDto> tasks,
        List<MemberSearchDto> members,
        List<CommentSearchDto> comments
) {}
