package com.travel.sorewa.backend.service;

import com.travel.sorewa.backend.entity.Travel;
import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.repository.TravelRepository;
import com.travel.sorewa.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TravelService {

    private final TravelRepository travelRepository;
    private final UserRepository userRepository;

    public TravelService(TravelRepository travelRepository, UserRepository userRepository) {
        this.travelRepository = travelRepository;
        this.userRepository = userRepository;
    }

    // 1. 一覧取得：特定のユーザーの旅行先一覧を並び替え順で取得
    public List<Travel> getTravelList(String userId) {
        return travelRepository.findByUser_UserIdOrderByTravelIdSubAsc(userId);
    }

    // 2. 登録：旅行先を新しく登録
    public Travel createTravel(String userId, String destination, Integer idSub) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("指定されたユーザーが存在しません"));

        Travel travel = new Travel();
        travel.setUser(user);
        travel.setTravelDestination(destination);
        travel.setTravelIdSub(idSub);

        return travelRepository.save(travel);
    }

    // 3. 更新：旅行先情報を更新
    public Optional<Travel> updateTravel(Long travelId, String destination, Integer idSub) {
        return travelRepository.findById(travelId).map(travel -> {
            travel.setTravelDestination(destination);
            travel.setTravelIdSub(idSub);
            return travelRepository.save(travel);
        });
    }

    // 4. 削除：旅行先を削除
    public boolean deleteTravel(Long travelId) {
        if (travelRepository.existsById(travelId)) {
            travelRepository.deleteById(travelId);
            return true;
        }
        return false;
    }

    // 💡 👥【新設】共同編集用に、データベースにある全ての旅行先を丸ごとロードするメソッドです
    public List<Travel> getAllTravelList() {
        return travelRepository.findAll(); // JPAの標準機能で全件引っ張ってきます！
    }
}
