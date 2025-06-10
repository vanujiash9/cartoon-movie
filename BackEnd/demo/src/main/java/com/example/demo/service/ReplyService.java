package com.example.demo.service;

import com.example.demo.entity.Reply;
import com.example.demo.repository.ReplyRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReplyService {
    private final ReplyRepository replyRepository;

    public ReplyService(ReplyRepository replyRepository) {
        this.replyRepository = replyRepository;
    }

    public List<Reply> getByReviewId(Integer reviewId) {
        return replyRepository.findByReviewId(reviewId);
    }

    public Reply create(Reply reply) {
        return replyRepository.save(reply);
    }
}
