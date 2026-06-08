package com.teamsync;

import static org.assertj.core.api.Assertions.assertThat;

import com.teamsync.dto.common.ApiResponse;
import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void successResponseUsesStandardShape() {
        ApiResponse<String> response = ApiResponse.success("Operation completed successfully", "ok");

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("Operation completed successfully");
        assertThat(response.data()).isEqualTo("ok");
        assertThat(response.errors()).isEmpty();
    }
}
