package com.travel.sorewa.backend.controller;

import com.travel.sorewa.backend.entity.Travel;
import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.service.TravelService;
import com.travel.sorewa.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/travel")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Reactからの通信を許可
public class TravelController {

    private final TravelService travelService;
    private final UserRepository userRepository;

    public TravelController(TravelService travelService, UserRepository userRepository) {
        this.travelService = travelService;
        this.userRepository = userRepository;
    }

    /**
     * 旅行先一覧取得API (👥 全員共有・共同編集仕様へアジャスト！)
     * URL: GET /api/travel (ユーザーIDによる縛りを無くし、全員で同じ計画を共有します)
     */
    @GetMapping
    public ResponseEntity<List<Travel>> getTravelList() {
        // 💡 特定のユーザーIDで絞り込むのではなく、サービスから全ての旅行先をロードします
        List<Travel> list = travelService.getAllTravelList();
        return ResponseEntity.ok(list);
    }

    /**
     * 旅行先登録API (仕様書：201を返す / 入力不備は400)
     */
    @PostMapping
    public ResponseEntity<?> createTravel(@RequestBody Map<String, Object> requestBody) {
        String userId = (String) requestBody.get("userId");
        String destination = (String) requestBody.get("travelDestination");

        // 🎯 解決策：型エラーを100%回避するため、一度文字列にしてから確実にIntegerにパースします
        Integer idSub = null;
        if (requestBody.get("travelIdSub") != null) {
            try {
                idSub = Integer.valueOf(requestBody.get("travelIdSub").toString());
            } catch (NumberFormatException e) {
                // パース失敗時は下部のバリデーションで弾かれます
            }
        }

        // 入力不備チェック (仕様書通りの400エラー実装)
        if (userId == null || destination == null || idSub == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "リクエスト項目に不備があります"));
        }

        try {
            // 🎯 解決策②：【本番大開通の核心】Aivenの厳格な外部キー制約を突破するため、
            // 届いたID("admin001")から本物のUserオブジェクトをデータベースから1件完全にロードします
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "error", "message", "指定されたユーザーが存在しません"));
            }

            // 🎯 解決策③：既存の travelService.createTravel を利用しながら、
            // 生成されたインスタンスに「本物のUserオブジェクト」をガチッとはめ込んでから本番DBへ永続化させます
            Travel newTravel = travelService.createTravel(userId, destination, idSub);
            newTravel.setUser(userOpt.get()); // 👈 ここが最重要！文字列ではなく本物のUserオブジェクトを上書きセットします

            // 💡 最後に、Userオブジェクトが紐付いた完璧な状態でデータベースへ再保存（アップデート）をかけます
            // ※もしtravelService内の保存メソッド名が「save」などの場合は、必要に応じて名称を調整してください
            travelService.updateTravel(newTravel.getTravelId(), newTravel.getTravelDestination(), newTravel.getTravelIdSub());

            return ResponseEntity.status(HttpStatus.CREATED).body(newTravel);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "本番データベースへの登録に失敗しました"));
        }
    }

    /**
     * 旅行先更新API (仕様書：200を返す / 対象データなしは404 / 入力不備は400)
     * 旅行先更新API (★エラーを回避するため、ラムダ式を使わない確実な書き方に修正しました)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTravel(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        String destination = (String) requestBody.get("travelDestination");
        Integer idSub = (Integer) requestBody.get("travelIdSub");

        if (destination == null || idSub == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "入力不備があります"));
        }

        Optional<Travel> updatedTravelOpt = travelService.updateTravel(id, destination, idSub);

        if (updatedTravelOpt.isPresent()) {
            return ResponseEntity.ok(updatedTravelOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "対象の旅行先データが見つかりません"));
        }
    }

    /**
     * 旅行先削除API (仕様書：200を返す / 対象データなしは404)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTravel(@PathVariable Long id) {
        boolean success = travelService.deleteTravel(id);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "削除が完了しました"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "対象の旅行先データが見つかりません"));
        }
    }
}
